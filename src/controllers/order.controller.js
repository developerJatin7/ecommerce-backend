import mongoose from "mongoose";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Product } from "../models/product.model.js";

const placeOrder = asyncHandler(async (req, res) => {
    // Extract shipping address and payment method from request body
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !paymentMethod) {
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

    if (
        !fullName?.trim() ||
        !phone?.trim() ||
        !addressLine1?.trim() ||
        !city?.trim() ||
        !state?.trim() ||
        !postalCode?.trim() ||
        !country?.trim()
    ) {
        throw new ApiError
            (
                400,
                "All fields in shipping address are required"
            );
    }

    //validate payment method

    const allowedPaymentMethods = ["cod", "online"];
    if (!allowedPaymentMethods.includes(paymentMethod)) {
        throw new ApiError
            (
                400,
                "Invalid payment method"
            );
    }

    // find user's cart

    const cart = await Cart.findOne(
        {
            user: req.user._id
        }
    )
    if (!cart) {
        throw new ApiError
            (
                404,
                "Cart not found"
            );
    }

    if (cart.items.length === 0) {
        throw new ApiError
            (
                400,
                "Cart is empty"
            );
    }

    const orderItems = []
    let totalAmount = 0

    // Validate each product in the cart
    for (const cartItem of cart.items) {

        const product = await Product.findById(
            cartItem.product
        );

        if (!product) {
            throw new ApiError(
                404,
                `Product with ID ${cartItem.product} not found`
            );
        }

        if (!product.isActive) {
            throw new ApiError(
                400,
                `Product ${product.name} is not available for purchase`
            );
        }

        if (cartItem.quantity > product.stock) {
            throw new ApiError(
                400,
                `Insufficient stock for product ${product.name}`
            );
        }

        const subtotal =
            product.price * cartItem.quantity;

        orderItems.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: cartItem.quantity,
            subtotal
        });

        totalAmount += subtotal;
    }


    // Start a session for transaction
    const session = await mongoose.startSession();

    let order;

    try {

        session.startTransaction();

        const createdOrder = await Order.create(
            [
                {
                    user: req.user._id,
                    items: orderItems,
                    shippingAddress,
                    totalAmount,
                    paymentMethod
                }
            ],
            {
                session
            }
        );

        order = createdOrder[0];

        for (const item of orderItems) {

            const updatedProduct =
                await Product.findOneAndUpdate(
                    {
                        _id: item.product,
                        isActive: true,
                        stock: {
                            $gte: item.quantity
                        }
                    },
                    {
                        $inc: {
                            stock: -item.quantity
                        }
                    },
                    {
                        new: true,
                        session
                    }
                );

            if (!updatedProduct) {
                throw new ApiError(
                    400,
                    `Insufficient stock or unavailable product: ${item.name}`
                );
            }
        }

        cart.items = [];

        await cart.save({
            session
        });

        await session.commitTransaction();

    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            order,
            "Order placed successfully"
        )
    );


})

const getMyOrders = asyncHandler(async (req, res) => {
    // Fetch orders from user
    const orders = await Order.find({
        user: req.user._id
    }).sort({
        createdAt: -1
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                orders,
                "Orders fetched successfully"
            )
        )
})

const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    //Validate orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        throw new ApiError(
            400, "Invalid order ID"
        )
    }

    //Fetch order by ID
    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id
    })

    //Check if order exists
    if (!order) {
        throw new ApiError(
            404, "Order not found"
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                order,
                "Order fetched successfully"
            )
        )
})

const getAllOrders = asyncHandler(async (req, res) => {

    const orders = await Order.find().sort({
        createdAt: -1
    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                orders,
                "All orders fetched successfully"
            )
        )
})

export {
    placeOrder,
    getMyOrders,
    getOrderById,
    getAllOrders
};