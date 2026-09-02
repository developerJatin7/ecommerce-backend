import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    category:{
        type: String,
        required: true,
        trim: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    brand: {
        type: String,
        trim: true,
        default: ""

    },
    images: [{
        type: String,
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {timestamps: true});

export const Product = mongoose.model("Product", productSchema);