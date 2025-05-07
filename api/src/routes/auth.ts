import express from "express";
import * as authController from "../controllers/authController";
import { authenticateToken, authorize } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", authController.register);

router.post("/login", authController.login);

router.post(
  "/register-admin",
  authenticateToken,
  authorize("Admin"),
  authController.createAdmin
);
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, authController.updateProfile);
router.put(
  "/change-password",
  authenticateToken,
  authController.changePassword
);

export default router;
