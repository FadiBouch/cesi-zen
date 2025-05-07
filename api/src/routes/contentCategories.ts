// Routes pour les catégories de contenu
import express from "express";
import * as categoryController from "../controllers/contentCategoryController";
import { authenticateToken, authorize } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/slug/:slug", categoryController.getCategoryBySlug);
router.get("/:id/contents", categoryController.getCategoryContents);

router.post(
  "/",
  authenticateToken,
  authorize("Admin"),
  categoryController.createCategory
);

router.put(
  "/:id",
  authenticateToken,
  authorize("Admin"),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  authenticateToken,
  authorize("Admin"),
  categoryController.deleteCategory
);

export default router;
