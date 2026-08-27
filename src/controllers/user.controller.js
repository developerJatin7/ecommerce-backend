import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../utils/generateTokens.js";

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (
        [name, email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(
            400,
            "User with this email already exists"
        );
    }

    const user = await User.create({
        name,
        email,
        password
    });

    const { accessToken, refreshToken } =
        await generateAccessAndRefreshToken(user._id);

    const createdUser = await User
        .findById(user._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken
                },
                "User registered successfully"
            )
        );
});

export {
    registerUser
};