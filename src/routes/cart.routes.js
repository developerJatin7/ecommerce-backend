import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addtoCart,
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

router.post("/items", verifyJWT, addtoCart)
router.get("/", verifyJWT, getCart)
router.patch("/items/:productId", verifyJWT, updateCartItem)
router.delete( "/items/:productId", verifyJWT, removeCartItem)
router.delete( "/items", verifyJWT, clearCart)
   
    
   

export default router;