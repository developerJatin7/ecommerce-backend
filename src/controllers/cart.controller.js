import mongoose from "mongoose";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addtoCart = asyncHandler(async (req, res) => {

    const { productId, quantity = 1 } = req.body;

    // 1. Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    // 2. Validate quantity
    const quantityNumber = Number(quantity);

    if (
        !Number.isInteger(quantityNumber) ||
        quantityNumber <= 0
    ) {
        throw new ApiError(
            400,
            "Quantity must be a positive integer"
        );
    }

    // 3. Find product
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // 4. Check product availability
    if (!product.isActive) {
        throw new ApiError(
            400,
            "Product is not available for purchase"
        );
    }

    // 5. Check initial requested quantity
    if (quantityNumber > product.stock) {
        throw new ApiError(
            400,
            "Insufficient stock for the requested quantity"
        );
    }

    // 6. Find user's cart
    let cart = await Cart.findOne({
        user: req.user._id
    });

    // 7. Create empty cart if user doesn't have one
    if (!cart) {
        cart = new Cart({
            user: req.user._id,
            items: []
        });
    }

    // 8. Find product inside cart
    const existingItem = cart.items.find(
        (item) =>
            item.product.toString() === productId
    );

    // 9. Product already exists
    if (existingItem) {

        const newQuantity =
            existingItem.quantity + quantityNumber;

        if (newQuantity > product.stock) {
            throw new ApiError(
                400,
                "Insufficient stock for the requested quantity"
            );
        }

        existingItem.quantity = newQuantity;

    } else {

        // 10. Product does not exist in cart
        cart.items.push({
            product: product._id,
            quantity: quantityNumber
        });

    }

    // 11. Save cart
    await cart.save();

    // 12. Return response
    return res.status(200).json(
        new ApiResponse(
            200,
            cart,
            "Product added to cart successfully"
        )
    );
});

const getCart = asyncHandler(async (req, res) => {

    const cart = await Cart.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(
                    req.user._id
                )
            }
        },

        {
            $unwind: "$items"
        },

        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },

        {
            $unwind: "$productDetails"
        },

        {
            $addFields: {
                itemSubtotal: {
                    $multiply: [
                        "$items.quantity",
                        "$productDetails.price"
                    ]
                }
            }
        },

        {
            $group: {
                _id: "$_id",

                user: {
                    $first: "$user"
                },

                items: {
                    $push: {
                        productId: "$productDetails._id",
                        name: "$productDetails.name",
                        price: "$productDetails.price",
                        quantity: "$items.quantity",
                        subtotal: "$itemSubtotal"
                    }
                },

                totalItems: {
                    $sum: "$items.quantity"
                },

                grandTotal: {
                    $sum: "$itemSubtotal"
                }
            }
        },

        {
            $project: {
                _id: 0,
                cartId: "$_id",
                user: 1,
                items: 1,
                totalItems: 1,
                grandTotal: 1
            }
        }
    ]);

    if (cart.length === 0) {
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    items: [],
                    totalItems: 0,
                    grandTotal: 0
                },
                "Cart is empty"
            )
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            cart[0],
            "Cart fetched successfully"
        )
    );
});

const updateCartItem = asyncHandler(async (req, res) => {
    // Implementation for updating a cart item will go here
    //extract productId from req.params and quantity from req.body
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    // Validate quantity
    const quantityNumber = Number(quantity);
    if (!Number.isInteger(quantityNumber) || quantityNumber <= 0) {
        throw new ApiError(400, "Quantity must be a positive Integer");
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    //Check product availability
    if (!product.isActive) {
        throw new ApiError(400, "product is not available for purchase");
    }

    //Check Stock availability
    if (quantityNumber > product.stock) {
        throw new ApiError(400, "Insufficient stock for the requested quantity");
    }

    //Find user's cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    //Find product inside cart
    const existingItem = cart.items.find(
        (item)=> item.product.toString() === productId
    )

    if(!existingItem){
        throw new ApiError(404, "Product not Found in cart");
    }

    //Update quantity
    existingItem.quantity = quantityNumber;

    //Save cart
    await cart.save();

    //Return response
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            cart,
            "Cart item updated successfully"
        )
    )
})

const deleteCartItem = asyncHandler(async (req, res) => {
    //Get productId from req.params
    const{ productId } = req.params;

    //Validate productId
    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product ID");
    }

    //Find user's cart
    let cart = await Cart.findOne({ user: req.user._id});
    if(!cart){
        throw new ApiError(404, "Cart not found");
    }

    //Find product inside cart
    const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
    )
    if(!existingItem){
        throw new ApiError(404, "Product not found in cart");
    }

    //Remove product from cart
    cart.items = cart.items.filter(
        (items) => items.product.toString() !== productId
    )

    //Save cart
    await cart.save();

    //Return response
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            cart,
            "Cart item removed successfully"
        )
    )
})

export {
    addtoCart,
    getCart,
    updateCartItem,
    deleteCartItem
};