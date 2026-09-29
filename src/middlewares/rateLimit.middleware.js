import { rateLimit } from "express-rate-limit";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    limit: 100,

    standardHeaders: "draft-8",

    legacyHeaders: false,

    message: {
        success: false,
        statusCode: 429,
        message: "Too many requests, please try again later"
    }
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,

    standardHeaders: "draft-8",
    legacyHeaders: false,

    skipSuccessfulRequests: true,

    message: {
        success: false,
        statusCode: 429,
        message:
            "Too many failed authentication attempts, please try again later"
    }
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        statusCode: 429,
        message:
            "Too many registration attempts, please try again later"
    }
});

export { 
    apiLimiter,
    loginLimiter,
    registerLimiter
 };