import { Router } from 'express';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview,
    getProductRating
} from '../controllers/review.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import createReviewSchema from '../validators/review.validator.js';

const router = Router();

router.post('/products/:productId/reviews', verifyJWT, validate(createReviewSchema), createReview);
router.get("/products/:productId/reviews", getProductReviews);
router.patch("/review/:reviewId",verifyJWT,updateReview)
router.delete("/review/:reviewId",verifyJWT,deleteReview)
router.get("/products/:productId/rating", getProductRating);
    
   


export default router;