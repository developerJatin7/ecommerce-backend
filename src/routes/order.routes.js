import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    getAllOrders
} from "../controllers/order.controller.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", verifyJWT, placeOrder);
router.get("/my-orders", verifyJWT, getMyOrders);
router.get("/:orderId", verifyJWT, getOrderById);
router.get("/",verifyJwt , authorizeRoles("admin"), getAllOrders);

export default router;