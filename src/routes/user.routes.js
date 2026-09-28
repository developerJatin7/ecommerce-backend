import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar

} from "../controllers/user.controller.js";
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from "../middlewares/multer.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { 
    registerUserSchema,
    loginUserSchema,
    changePasswordSchema,
    updateAccountSchema,
    refreshTokenSchema
 } from "../validators/user.validator.js";
const router = Router();

router.post("/register", validate(registerUserSchema), registerUser);
router.post("/login",validate(loginUserSchema), loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/refresh-token", validate(refreshTokenSchema), refreshAccessToken);
router.post("/change-password", verifyJWT, validate(changePasswordSchema), changeCurrentPassword);
router.get("/me", verifyJWT, getCurrentUser);
router.patch("/update-account", verifyJWT,validate(updateAccountSchema), updateAccountDetails);
router.patch("/update-avatar",verifyJWT,upload.single("avatar"),updateUserAvatar
);


export default router;