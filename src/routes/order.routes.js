import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
} from "../controllers/order.controller.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/", verifyJWT, placeOrder);
router.get("/my-orders", verifyJWT, getMyOrders);
router.get("/:orderId", verifyJWT, getOrderById);
router.get("/",verifyJWT , authorizeRoles("admin"), getAllOrders);
router.patch("/:orderId/status", verifyJWT, authorizeRoles("admin"), updateOrderStatus);

export default router;