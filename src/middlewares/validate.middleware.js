import { ApiError } from "../utils/ApiError.js";

const validate = (schema) => {
    return (req, res, next) => {

        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
            cookies: req.cookies
        });

        if (!result.success) {

            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message
            }));

            throw new ApiError(
                400,
                "Validation failed",
                errors
            );
        }

        req.validatedData = result.data;

        next();
    };
};

export { validate };