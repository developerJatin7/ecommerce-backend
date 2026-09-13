import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const placeOrder = asyncHandler(async (req, res) => {
    // Extract shipping address and payment method from request body
    const { shippingAddress, paymentMethod } = req.body;
    if(!shippingAddress || !paymentMethod) {
        throw new ApiError(400, "Shipping address and payment method are required");
    }

    //validate shipping address

    const {
        fullName,
    phone,
    addressLine1,
    city,
    state,
    postalCode,
    country
    } = shippingAddress;

    if(
        !fullName?.trim() ||
        !phone?.trim() ||
        !addressLine1?.trim() ||
        !city?.trim() ||
        !state?.trim() ||
        !postalCode?.trim() ||
        !country?.trim()
    ) {
        throw new ApiError(400, "All fields in shipping address are required");
    }
    
    //validate payment method

    const allowedPaymentMethods = ["cod", "online"];
    if(!allowedPaymentMethods.includes(paymentMethod)) {
        throw new ApiError(400, "Invalid payment method");
    }

    // find user's cart

    const cart = await Cart.findOne(
        {
            user: req.user._id
        }
    )
    if(!cart) {
        throw new ApiError(404, "Cart not found");
    }

    if(cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    const orderItems = []
    let totalAmount = 0
})

export { placeOrder };