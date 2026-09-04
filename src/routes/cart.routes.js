import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addtoCart } from "../controllers/cart.controller.js";

const router = Router();

router.post("/items", verifyJWT, addtoCart)

export default router;