const errorHandler = (
    err,
    req,
    res,
    next
) => {

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