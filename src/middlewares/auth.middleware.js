import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : req.cookies?.accessToken;

        console.log("AUTH HEADER:", authHeader);
        console.log("TOKEN:", token);
        console.log("TOKEN TYPE:", typeof token);

        if (!token || typeof token !== "string") {
            throw new ApiError(401, "Access token missing or invalid");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET
        );

        const user = await User
            .findById(decodedToken._id)
            .select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();

    } catch (error) {
        console.log("JWT ERROR:", error.name, error.message);

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            401,
            error.message || "Invalid or expired access token"
        );
    }
});