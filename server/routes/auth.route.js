// Packages
import express from "express";

// Configs
import uploadCloud from "../config/cloudinary.js";

// Controllers
import {
  loginUser,
  registerUser,
  updateAvatar,
  resetPassword,
  getUserProfile,
  forgotPassword,
  deleteUserAccount,
  updateUserProfile,
} from "../controllers/auth.controller.js";

// Middlewares
import { protect } from "../middlewares/auth.middleware.js";
;
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/profile", protect, getUserProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.delete("/profile", protect, deleteUserAccount);
router.put("/profile", protect, uploadCloud.single("avatar"), updateUserProfile);
router.put("/profile/avatar", protect, uploadCloud.single("image"), updateAvatar);

export default router;
