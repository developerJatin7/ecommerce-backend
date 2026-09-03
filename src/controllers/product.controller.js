import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"

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
        brand,
        images
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

const getProductById = asyncHandler(async(req, res)=>{
    const {productId} = req.params
    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product ID");
    }
    
    const product = await Product.findOne({
        _id: productId,
        isActive: true
    });

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            product,
            "Product fetched successfully"
        )
    );
})

const updateProduct = asyncHandler(async(req, res)=>{
    const {productId} = req.params

    const{
        name,
        description,
        price,
        category,
        stock,
        brand,
        isActive
    } = req.body
    
    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(400, "Invalid product ID");
    }

    const product = await Product.findById(productId)
    if(!product){
        throw new ApiError(404, "Product not found");
    }

    if(name!==undefined){
        product.name = name;
    }

    if (description !== undefined) {
        product.description = description;
    }

    if (price !== undefined) {
        product.price = price;
    }

    if (category !== undefined) {
        product.category = category;
    }

    if (stock !== undefined) {
        product.stock = stock;
    }

    if (brand !== undefined) {
        product.brand = brand;
    }

    if (isActive !== undefined) {
        product.isActive = isActive;
    }

    await product.save()

     return res.status(200).json(
        new ApiResponse(
            200,
            product,
            "Product updated successfully"
        )
    );
})

const deleteProduct = asyncHandler(async(req, res)=>{
    const {productId} = req.params
    if(!mongoose.Types.ObjectId.isValid(productId)){
        throw new ApiError(404, "Invalid product ID")
    }

    const product = await Product.findById(productId)
    if(!product){
        throw new ApiError(404, "Product not found")
    }

    product.isActive = false
    await product.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Product deleted successfully"
        )
    )


})

export {
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
    deleteProduct
};
