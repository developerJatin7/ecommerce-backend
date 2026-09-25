import { Router } from 'express';
import {
    createReview,
    getProductReviews,
    updateReview,
    deleteReview
} from '../controllers/review.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/products/:productId/reviews', verifyJWT, createReview);
router.get("/products/:productId/reviews", getProductReviews);
router.patch("/review/:reviewId",verifyJWT,updateReview)
router.delete("/review/:reviewId",verifyJWT,deleteReview)
    
   


export default router;