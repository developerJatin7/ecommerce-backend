import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from "helmet";
import { apiLimiter } from './middlewares/rateLimit.middleware.js';
import morgan from "morgan";

const app = express();

app.use(helmet());

app.use(cors({
       origin: process.env.CORS_ORIGIN,
       crdentials: true
}));

// Development HTTP logging
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}




app.use("/api", apiLimiter);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Routes
import userRouter from './routes/user.routes.js';
import productRouter from './routes/product.routes.js';
import cartRouter from './routes/cart.routes.js';
import orderRouter from './routes/order.routes.js';
import reviewRouter from './routes/review.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';



//Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1", reviewRouter);

// Error handling middleware
app.use(errorHandler);

export default app;