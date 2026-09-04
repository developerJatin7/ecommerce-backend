import { Cart } from "../models/cart.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Add to Cart Controller
const addtoCart = asyncHandler(async (req, res) => {
    const { productId, quantity = 1} = req.body;
    // Validate productId and quantity
    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product ID");
    }

    // Validate quantity
    const quantityNumber = Number(quantity);
    if(!Number.isInteger(quantityNumber) || quantityNumber <= 0){
        throw new ApiError(400, "Quantity must be a positive integer");
    }
    
    // Check if the product exists and is available for purchase
    const product = await Product.findById(productId);
    if(!product){
        throw new ApiError(404, "Product not found");
    }

    // Check if the product is active and has sufficient stock
    if(!product.isActive){
        throw new ApiError(400, "Product is not available for purchase");
    }

    // Check if the requested quantity exceeds available stock
    if(product.stock < quantityNumber){
        throw new ApiError(400, "Insufficient stock for the requested quantity");
    }

    // Find the user's cart or create a new one if it doesn't exist
    let cart = await Cart.findOne({ user: req.user._id });
    if(!cart){
        cart = new Cart({
            user: req.user._id,
            items: [{ product: productId, quantity: quantityNumber }]
        });
    }

    // Check if the product is already in the cart
   const existingItem = cart.items.find((item) =>
        item.product.toString() === productId
); 

// If the product is already in the cart, update the quantity
const newQuantity = existingItem.quantity + quantityNumber;
if(newQuantity > product.stock){
    throw new ApiError(400, "Insufficient stock for the requested quantity")
}

// Update the quantity of the existing item
cart.items.push({ product: productId, quantity: quantityNumber });

// If the product is not in the cart, add it as a new item
await cart.save();

return res.status(200).json(
    new ApiResponse(
        200,
        cart,
        "Product added to cart successfully"
    )
);

})


export { 
    addtoCart
 };