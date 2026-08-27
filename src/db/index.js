import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from .env");
        }

        const connectionUri = `${process.env.MONGODB_URI.replace(/\/+$/, "")}/${DB_NAME}`;
        const connectionInstance = await mongoose.connect(connectionUri, {
            authSource: "admin"
        });
        console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);

    }
    catch (error) {
        console.log("MongoDB connection failed !!!", error);
        process.exit(1);
    }
}

export default connectDB;