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

const updateReviewSchema = z.object({

    params: z.object({
        reviewId: z
            .string()
            .regex(
                /^[0-9a-fA-F]{24}$/,
                "Invalid review ID"
            )
    }),

    body: z.object({

        rating: z
            .number()
            .int("Rating must be an integer")
            .min(1, "Rating must be at least 1")
            .max(
                5,
                "Rating cannot be greater than 5"
            )
            .optional(),

        comment: z
            .string()
            .trim()
            .min(
                1,
                "Review comment cannot be empty"
            )
            .max(
                1000,
                "Review comment cannot exceed 1000 characters"
            )
            .optional()

    }).refine(
        (data) =>
            data.rating !== undefined ||
            data.comment !== undefined,
        {
            message:
                "Rating or comment is required"
        }
    )
});

export {
    createReviewSchema,
    updateReviewSchema
}

