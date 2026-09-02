import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, stock, brand, images } = req.body;
    if (!name || !description || price == null || !category || stock == null) {
        throw new ApiError(400, "Required product fields are missing");
    }
    const product = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        brand
    })
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                product,
                "Product created successfully"
            )
        );
});

const getAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({
        isActive: true
    })
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                products,
                "Products fetched successfully"
            )
        )
})



export {
    createProduct,
    getAllProducts
};
