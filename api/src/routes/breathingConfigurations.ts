// Routes pour les configurations d'exercices respiratoires
import express from "express";
import * as breathingConfigController from "../controllers/breathingConfigController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", breathingConfigController.getAllBreathingConfigs);
router.get("/:id", breathingConfigController.getBreathingConfigById);

router.use(authenticateToken);

// router.get(
//   "/user/favorites",
//   authenticateToken,
//   breathingConfigController.getUserFavoriteConfigs
// );
router.post(
  "/",
  authenticateToken,
  breathingConfigController.createBreathingConfig
);
router.put(
  "/:id",
  authenticateToken,
  breathingConfigController.updateBreathingConfig
);
router.delete(
  "/:id",
  authenticateToken,
  breathingConfigController.deleteBreathingConfig
);
// router.post(
//   "/:id/favorite",
//   authenticateToken,
//   breathingConfigController.addToFavorites
// );

export default router;
