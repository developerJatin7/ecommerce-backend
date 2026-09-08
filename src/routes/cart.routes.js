import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addtoCart,
    getCart
} from "../controllers/cart.controller.js";

const router = Router();

router.post("/items", verifyJWT, addtoCart)
router.get("/", verifyJWT, getCart)

export default router;