import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    placeOrder,
    getMyOrders,
    getOrderById
} from "../controllers/order.controller.js";

const router = Router();

router.post("/", verifyJWT, placeOrder);
router.get("/my-orders", verifyJWT, getMyOrders);
router.get("/:orderId", verifyJWT, getOrderById);

export default router;