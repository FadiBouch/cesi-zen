// Routes pour les types d'exercices respiratoires
import express from "express";
import * as breathingTypeController from "../controllers/breathingTypeController";
import { authenticateToken, authorize } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", breathingTypeController.getAllBreathingTypes);
router.get("/:id", breathingTypeController.getBreathingTypeById);
router.get(
  "/:id/configurations",
  breathingTypeController.getTypeConfigurations
);

// Routes protégées - Nécessitent un rôle administrateur
router.post(
  "/",
  authenticateToken,
  authorize("Admin"),
  breathingTypeController.createBreathingType
);

router.put(
  "/:id",
  authenticateToken,
  authorize("Admin"),
  breathingTypeController.updateBreathingType
);

router.delete(
  "/:id",
  authenticateToken,
  authorize("Admin"),
  breathingTypeController.deleteBreathingType
);

export default router;
