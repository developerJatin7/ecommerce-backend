import { Router } from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    updateProductImages
} from "../controllers/product.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/authorize.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.post("/", verifyJWT, authorizeRoles("admin"), createProduct);
router.get("/", getAllProducts);
router.get("/:productId", getProductById);
router.patch("/:productId", verifyJWT, authorizeRoles("admin"), updateProduct);
router.delete("/:productId", verifyJWT, authorizeRoles("admin"), deleteProduct);
router.patch("/:productId/images",verifyJWT,authorizeRoles("admin"),upload.array("images", 5),updateProductImages);
export default router;