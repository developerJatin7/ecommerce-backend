import { z } from 'zod';

const createReviewSchema = z.object({
    params: z.object({
        productId: z.string().regex(
            /^[0-9a-fA-F]{24}$/,
            "Invalid product ID"
        )
    }),

    body: z.object({
        rating: z
            .number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(5, "Rating cannot be greater than 5"),

        comment: z
            .string()
            .trim()
            .min(1, "Review comment is required")
            .max(
                1000,
                "Review comment cannot exceed 1000 characters"
            )
    })
});

export default createReviewSchema;

