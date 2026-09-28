import multer from "multer";




const errorHandler = (
    err,
    req,
    res,
    next
) => {

    // 1. Handle Multer-specific errors
    if (err instanceof multer.MulterError) {

        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                statusCode: 400,
                message: "File size cannot exceed 5 MB",
                errors: []
            });
        }

        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: err.message,
            errors: []
        });
    }


    // 2. Handle ApiError and other errors
    const statusCode =
        err.statusCode || 500;

    const message =
        err.message || "Internal Server Error";


    return res
        .status(statusCode)
        .json({
            success: false,
            statusCode,
            message,
            errors: err.errors || [],

            ...(process.env.NODE_ENV === "development" && {
                stack: err.stack
            })
        });
};



export { errorHandler };