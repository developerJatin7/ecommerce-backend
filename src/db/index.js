import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";


const connectDB = async () => {
    try {

        if (!process.env.MONGODB_URI) {
            throw new Error(
                "MONGODB_URI is missing from environment variables"
            );
        }

        const databaseName =
            process.env.NODE_ENV === "test"
                ? `${DB_NAME}_test`
                : DB_NAME;


        const connectionUri =
            `${process.env.MONGODB_URI.replace(/\/+$/, "")}/${databaseName}`;


        const connectionInstance =
            await mongoose.connect(
                connectionUri,
                {
                    authSource: "admin"
                }
            );


        console.log(
            `MongoDB connected: ${connectionInstance.connection.name}`
        );

    } catch (error) {

        console.log(
            "MongoDB connection failed !!!",
            error
        );

        throw error;
    }
};


export default connectDB;