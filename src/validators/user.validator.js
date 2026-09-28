import { z } from "zod";

const registerUserSchema = z.object({

    body: z.object({

        name: z
            .string()
            .trim()
            .min(
                2,
                "Name must contain at least 2 characters"
            )
            .max(
                50,
                "Name cannot exceed 50 characters"
            ),

        email: z
            .string()
            .trim()
            .toLowerCase()
            .email(
                "Please provide a valid email address"
            ),

        password: z
            .string()
            .min(
                8,
                "Password must contain at least 8 characters"
            )
            .max(
                100,
                "Password cannot exceed 100 characters"
            )
    })
});

const loginUserSchema = z.object({

    body: z.object({

        email: z
            .string()
            .trim()
            .toLowerCase()
            .email(
                "Please provide a valid email address"
            ),

        password: z
            .string()
            .min(
                1,
                "Password is required"
            )
    })
});

const changePasswordSchema = z.object({

    body: z.object({

        oldPassword: z
            .string()
            .min(
                1,
                "Old password is required"
            ),

        newPassword: z
            .string()
            .min(
                8,
                "New password must contain at least 8 characters"
            )
            .max(
                100,
                "New password cannot exceed 100 characters"
            )

    }).refine(
        (data) =>
            data.oldPassword !== data.newPassword,
        {
            message:
                "New password must be different from old password",
            path: ["newPassword"]
        }
    )
});

const updateAccountSchema = z.object({

    body: z.object({

        name: z
            .string()
            .trim()
            .min(
                2,
                "Name must contain at least 2 characters"
            )
            .max(
                50,
                "Name cannot exceed 50 characters"
            )
            .optional(),

        email: z
            .string()
            .trim()
            .toLowerCase()
            .email(
                "Please provide a valid email address"
            )
            .optional()

    }).refine(
        (data) =>
            data.name !== undefined ||
            data.email !== undefined,
        {
            message:
                "Name or email is required"
        }
    )
});

const refreshTokenSchema = z.object({

    body: z.object({
        refreshToken: z
            .string()
            .min(
                1,
                "Refresh token cannot be empty"
            )
            .optional()
    }),

    cookies: z.object({
        refreshToken: z
            .string()
            .min(
                1,
                "Refresh token cannot be empty"
            )
            .optional()
    })

}).refine(
    (data) =>
        data.cookies.refreshToken !== undefined ||
        data.body.refreshToken !== undefined,
    {
        message: "Refresh token is required"
    }
);

export { 
    registerUserSchema,
    loginUserSchema,
    changePasswordSchema,
    updateAccountSchema,
    refreshTokenSchema
};