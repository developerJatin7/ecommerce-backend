import "dotenv/config";

import app from "./app.js";
import connectDB from "./db/index.js";

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running on: ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.log("MongoDB connection failed", error);
    });