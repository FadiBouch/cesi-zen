// Routes pour les contenus
import express from "express";
import * as contentController from "../controllers/contentController";
import { authenticateToken, authorize } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", contentController.getAllContents);
router.get("/search", contentController.searchContents);
router.get("/:id", contentController.getContentById);
router.get("/slug/:slug", contentController.getContentBySlug);

router.post(
  "/",
  authenticateToken,
  authorize("Admin"),
  contentController.createContent
);

router.put(
  "/:id",
  authenticateToken,
  authorize("Admin"),
  contentController.updateContent
);

router.delete(
  "/:id",
  authenticateToken,
  authorize("Admin"),
  contentController.deleteContent
);

router.patch(
  "/:id/publish",
  authenticateToken,
  authorize("Admin"),
  contentController.togglePublishStatus
);

export default router;
