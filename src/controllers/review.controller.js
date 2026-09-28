import mongoose from 'mongoose';
import { Review } from '../models/review.model.js';
import { Product } from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createReview = asyncHandler(async (req, res) => {

    const { productId } =
        req.validatedData.params;

    const { rating, comment } =
        req.validatedData.body;


    // Check whether product actually exists
    const product = await Product.findById(productId);

    if (!product) {
        throw new ApiError(
            404,
            "Product not found"
        );
    }


    // Business rule:
    // inactive products cannot be reviewed
    if (!product.isActive) {
        throw new ApiError(
            400,
            "Cannot review an inactive product"
        );
    }


    // Business rule:
    // one review per user per product
    const existingReview = await Review.findOne({
        user: req.user._id,
        product: productId
    });

    if (existingReview) {
        throw new ApiError(
            409,
            "You have already reviewed this product"
        );
    }


    let review;

    try {
        review = await Review.create({
            user: req.user._id,
            product: productId,
            rating,
            comment
        });
    } catch (error) {

        if (error?.code === 11000) {
            throw new ApiError(
                409,
                "You have already reviewed this product"
            );
        }

        throw error;
    }


    return res.status(201).json(
        new ApiResponse(
            201,
            review,
            "Review created successfully"
        )
    );
});

const getProductReviews = asyncHandler(async (req, res) => {
    //get the product ID from the request parameters
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    //Check that product exist
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
        throw new ApiError(404, "Product not found")
    }

    //Add pagination
    const page = Number(req.query.page || 1)
    const limit = Number(req.query.limit || 10)
    if (!Number.isInteger(page) || page < 1,
        !Number.isInteger(limit) || limit < 1) {
        throw new ApiError(400, "Paage and Limit must be positive Number")
    }

    if (limit > 100) {
        throw new ApiError("Limit cannot exceed 100")
    }

    //Calculate skip
    const skip = (page - 1) * limit

    //Count reviews
    const totalReviews = await Review.countDocuments({
        product: productId
    })

    //Fetch Reviews
    const reviews = await Review.find({
        product: productId
    })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    //Calculate total pages
    const totalPages = Math.ceil(totalReviews / limit)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    reviews,
                    pagination: {
                        totalReviews,
                        page,
                        limit,
                        totalPages
                    }
                },
                "Product reviews fetched successfully"
            )
        )


})

const updateReview = asyncHandler(async (req, res) => {

    const { reviewId } =
        req.validatedData.params;

    const { rating, comment } =
        req.validatedData.body;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ApiError(
            404,
            "Review not found"
        );
    }


    // Check ownership
    if (!review.user.equals(req.user._id)) {
        throw new ApiError(
            403,
            "You are not authorized to update this review"
        );
    }


    // Update only fields supplied by the client
    if (rating !== undefined) {
        review.rating = rating;
    }

    if (comment !== undefined) {
    review.comment = comment;
}


    await review.save();


    return res.status(200).json(
        new ApiResponse(
            200,
            review,
            "Review updated successfully"
        )
    );
});

const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new ApiError(400, "Invalid review Id")
    }

    //find review
    const review = await Review.findById(reviewId)
    if (!review) {
        throw new ApiError(404, "Review not found")
    }

    //find ownership
    if (!review.user.equals(req.user._id)) {
        throw new ApiError(403, "you are not authorize to delete this review")
    }

    //Delete review
    await review.deleteOne()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Review deleted successfully"
            )
        )
})

const getProductRating = asyncHandler(async (req, res) => {
    const { productId } = req.params

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID")
    }

    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
        throw new ApiError(
            404,
            "Product not found"
        );
    }

    //Build aggregation pipeline
    const ratingStats = await Review.aggregate([
        {
            $match: {
                product: new mongoose.Types.ObjectId(productId)
            }
        },

        {
            $group: {
                _id: "$product",

                averageRating: { $avg: "$rating" },
                totalReviews: { $sum: 1 }
            }
        }
    ])

    //Handle products with no reviews
    const stats = ratingStats[0]
        ? {
            averageRating: Number(
                ratingStats[0].averageRating.toFixed(2)
            ),
            totalReviews: ratingStats[0].totalReviews
        }
        : {
            averageRating: 0,
            totalReviews: 0
        };

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                stats,
                "Product rating fetched successfully"
            )
        )


})

export {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getProductRating
}