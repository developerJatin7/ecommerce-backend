import "dotenv/config";

import app from "./app.js";
import connectDB from "./db/index.js";


const PORT = process.env.PORT || 5000;


connectDB()
    .then(() => {

        app.listen(PORT, () => {

            console.log(
                `Server is running on port: ${PORT}`
            );

        });

    })
    .catch((error) => {

        console.log(
            "Server startup failed:",
            error
        );

        process.exit(1);

    });