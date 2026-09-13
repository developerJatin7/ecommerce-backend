import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { placeOrder } from "../controllers/order.controller.js";

const router = Router();

router.post("/", verifyJWT, placeOrder);

export default router;