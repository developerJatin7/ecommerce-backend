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
    if(!mongoose.Types.ObjectId.isValid(productId)) {
        throw new ApiError(400, "Invalid product ID");
    }

    //validate the rating and comment
    if(
        !Number.isInteger(rating) || rating < 1 || rating > 5
    ) {
        throw new ApiError(400, "Rating must be an integer between 1 and 5");
    }

    if(typeof comment !== "string" || !comment.trim()){
        throw new ApiError(400, "Comment is required");
    }

    if(comment.trim().length > 1000) {
        throw new ApiError(400, "Comment must be less than 1000 characters");
    }

    //check if the product exists
    const product = await Product.findById(productId);
    if(!product) {
        throw new ApiError(404, "Product not found");
    }

    //check if product is active
    if(!product.isActive) {
        throw new ApiError(400, "Cannot review an inactive product");
    }

    //check if the user has already reviewed the product
    const existingReview = await Review.findOne({
         user: req.user._id, 
         product: productId
         });

         if(existingReview) {
            throw new ApiError(400, "You have already reviewed this product");
         }

         //create the review
    try {
        const review = await Review.create({
        user: req.user._id,
        product: productId,
        rating,
        comment: comment.trim()
    });
    } catch (error) {
        //compound unique index protection
        if(error?.code === 11000) {
            throw new ApiError(409, "You have already reviewed this product");
        }
        throw error;
    }

    return res
    .status(201)
    .json(new ApiResponse(
        true,
        review,
        "Review created successfully"
        
    ))
})

export{
    createReview
}