import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

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
    const {
        search,
        category,
        brand,
        minPrice,
        maxPrice,
        sort,
        page = 1,
        limit = 10
    } = req.query;

    if (minPrice && isNaN(minPrice)) {
        throw new ApiError(400, "minPrice must be a number")
    }

    if (maxPrice && isNaN(maxPrice)) {
        throw new ApiError(400, "maxPrice must be a number")
    }

    if (
        minPrice &&
        maxPrice &&
        Number(minPrice) > Number(maxPrice)
    ) {
        throw new ApiError(
            400,
            "minPrice cannot be greater than maxPrice"
        );
    }

    const allowedSortOptions = [
        "price_asc",
        "price_desc",
        "newest",
        "oldest"
    ];

    if (sort && !allowedSortOptions.includes(sort)) {
        throw new ApiError(
            400,
            "Invalid sort option"
        );
    }

    const filter = { isActive: true };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    if (
        isNaN(pageNumber) || pageNumber < 1
    ) {
        throw new ApiError(
            400,
            "Page number must be a positive integer"
        )
    }

    if (
        isNaN(limitNumber) || limitNumber < 1
    ) {
        throw new ApiError(
            400,
            "Limit must be a positive integer"
        )
    }

    if (limitNumber > 100) {
        throw new ApiError(
            400,
            "Limit cannot be greater than 100"
        );
    }
    const skip = (pageNumber - 1) * limitNumber;


    // Apply search filter
    if (category) {
        filter.category = {
            $regex: `^${category}$`,
            $options: "i"
        }
    }

    if (brand) {
        filter.brand = {
            $regex: `^${brand}$`,
            $options: "i"
        }
    }

    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                category: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                brand: {
                    $regex: search,
                    $options: "i"
                }
            },

        ]

    }

    if (minPrice && maxPrice) {
        filter.price = {}

        if (minPrice) {
            filter.price.$gte = Number(minPrice)
        }

        if (maxPrice) {
            filter.price.$lte = Number(maxPrice)
        }
    }

    const sortOptions = {};

    if (sort === "price_asc") {
        sortOptions.price = 1
    }

    if (sort === "price_desc") {
        sortOptions.price = -1
    }

    if (sort === "newest") {
        sortOptions.createdAt = -1;
    }

    if (sort === "oldest") {
        sortOptions.createdAt = 1;
    }


    const totalProducts = await Product.countDocuments(filter);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    const products = await Product
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber);


    return res.status(200).json(
        new ApiResponse(
            200,
            {
                products,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalProducts,
                    limit: limitNumber
                }
            },
            "Products fetched successfully"
        )
    );
})

const getProductById = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!mongoose.Types.ObjectId.isValid(productId)) {
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

const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params

    const {
        name,
        description,
        price,
        category,
        stock,
        brand,
        isActive
    } = req.body

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    const product = await Product.findById(productId)
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (name !== undefined) {
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

const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(404, "Invalid product ID")
    }

    const product = await Product.findById(productId)
    if (!product) {
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

const updateProductImages = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    //Check whether files were actually uploaded
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, "No images uploaded")
    }

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found")
    }

    // Upload new images to Cloudinary
    const uploadedImages = []
    for (const file of req.files) {
        const uploadedImage = await uploadOnCloudinary(file.path, "products");

       if (
        uploadedImage?.secure_url &&
        uploadedImage?.public_id
    ) {
        uploadedImages.push({
            url: uploadedImage.secure_url,
            publicId: uploadedImage.public_id
        });
    }
}

    if (uploadedImages.length === 0) {
        throw new ApiError(500, "Failed to upload images")
    }

    product.images.push(...uploadedImages);

    await product.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            product,
            "Product images uploaded successfully"
        )
    );
})

const deleteProductImage = asyncHandler(async (req, res) => {

    const { productId } = req.params;
    const { imageUrl } = req.body;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(
            400,
            "Invalid product ID"
        );
    }

    // Validate image URL
    if (!imageUrl) {
        throw new ApiError(
            400,
            "Image URL is required"
        );
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(
            404,
            "Product not found"
        );
    }

    // Check whether image belongs to this product
    const imageExists =
        product.images.includes(imageUrl);

    if (!imageExists) {
        throw new ApiError(
            404,
            "Image not found in product images"
        );
    }

    // Helper accepts the complete Cloudinary URL
    const cloudinaryResponse =
        await deleteFromCloudinary(imageUrl);

    // Check Cloudinary deletion
    if (cloudinaryResponse?.result !== "ok") {
        throw new ApiError(
            500,
            "Failed to delete image from Cloudinary"
        );
    }

    // Remove URL from MongoDB array
    product.images = product.images.filter(
        (url) => url !== imageUrl
    );

    // Persist changes
    await product.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            product,
            "Product image deleted successfully"
        )
    );
});

export {
    createProduct,
    updateProduct,
    getAllProducts,
    getProductById,
    deleteProduct,
    updateProductImages
};
