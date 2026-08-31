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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (
        [email, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

if (!user) {
    throw new ApiError(404, "User not found");
}

const isPasswordValid = await user.isPasswordCorrect(password);

if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
}

const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user._id);

const loggedInUser = await User
    .findById(user._id)
    .select("-password -refreshToken");

if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in");
}

return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});

export {
    registerUser,
    loginUser,
    logoutUser
};