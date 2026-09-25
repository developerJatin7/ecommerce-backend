import mongoose from 'mongoose';
import { Review } from '../models/review.model.js';
import { Product } from '../models/product.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const createReview = asyncHandler(async (req, res) => {
    //Get the product ID from the request parameters
    const { productId } = req.params;

    // get rating and comment from the request body
    const { rating, comment } = req.body

    //validate the product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    //validate the rating and comment
    if (
        !Number.isInteger(rating) || rating < 1 || rating > 5
    ) {
        throw new ApiError(400, "Rating must be an integer between 1 and 5");
    }

    if (typeof comment !== "string" || !comment.trim()) {
        throw new ApiError(400, "Comment is required");
    }

    if (comment.trim().length > 1000) {
        throw new ApiError(400, "Comment must be less than 1000 characters");
    }

    //check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    //check if product is active
    if (!product.isActive) {
        throw new ApiError(400, "Cannot review an inactive product");
    }

    //check if the user has already reviewed the product
    const existingReview = await Review.findOne({
        user: req.user._id,
        product: productId
    });

    if (existingReview) {
        throw new ApiError(400, "You have already reviewed this product");
    }

    //create the review
    let review;

    try {
        review = await Review.create({
            user: req.user._id,
            product: productId,
            rating,
            comment: comment.trim()
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

    return res
        .status(201)
        .json(new ApiResponse(
            201,
            review,
            "Review created successfully"

        ))
})

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
    const { reviewId } = req.params
    const { rating, comment } = req.body

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new ApiError(400, "Invalid review ID")
    }

    if (rating == undefined && comment == undefined) {
        throw new ApiError(400, "Rating or comment is required")
    }

    if (rating !== undefined) {
        if (
            !Number.isInteger(rating) ||
            rating < 1 ||
            rating > 5
        ) {
            throw new ApiError(
                400,
                "Rating must be an integer between 1 and 5"
            );
        }
    }

    if (comment !== undefined) {

        if (
            typeof comment !== "string" ||
            !comment.trim()
        ) {
            throw new ApiError(
                400,
                "Review comment cannot be empty"
            );
        }

        if (comment.trim().length > 1000) {
            throw new ApiError(
                400,
                "Review comment cannot exceed 1000 characters"
            );
        }
    }

    //Find Review
    const review = await Review.findById(reviewId)
    if (!review) {
        throw new ApiError(404, "Review not Found")
    }

    //Check Ownership
    if (!review.user.equals(req.user._id)) {
        throw new ApiError(403, "You are not authorize to update this review")
    }

    //Update rating only if provided
    if (rating !== undefined) {
        review.rating = rating
    }

    //Update comment only if provided
    if (comment !== undefined) {
        review.comment = comment
    }

    //Save
    await review.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                review,
                "Review Updated Successfully"
            )
        )
})

const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params

    if(!mongoose.Types.ObjectId.isValid(reviewId)){
        throw new ApiError(400, "Invalid review Id")
    }

    //find review
    const review = await Review.findById(reviewId)
    if(!review){
        throw new ApiError (404, "Review not found")
    }

    //find ownership
    if(!review.user.equals(req.user._id)){
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

export {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview
}