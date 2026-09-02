import { Router } from "express";
import { createProduct } from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";

const router = Router();

router.post("/",verifyJWT,authorizeRoles("admin"),createProduct);
router.get("/", getAllProducts);
export default router;