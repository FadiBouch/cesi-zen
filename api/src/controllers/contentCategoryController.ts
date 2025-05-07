// Contrôleur pour les catégories de contenu
import { Request, Response } from "express";
import prisma from "../utils/database";
import {
  CreateCategoryData,
  UpdateCategoryData,
  PaginationParams,
} from "../types/content";
import slugify from "slugify";

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      order = "desc",
      orderBy = "createdAt",
    } = req.query as unknown as PaginationParams;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const [categories, total] = await Promise.all([
      prisma.contentCategory.findMany({
        skip,
        take: limitNumber,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          _count: {
            select: { contents: true },
          },
        },
      }),
      prisma.contentCategory.count(),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: categories,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    const category = await prisma.contentCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    if (!category) {
      res.status(404).json({ message: "Catégorie non trouvée" });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getCategoryBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const category = await prisma.contentCategory.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    if (!category) {
      res.status(404).json({ message: "Catégorie non trouvée" });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, slug, description } = req.body as CreateCategoryData;

    const categorySlug = slug || slugify(name, { lower: true });

    const existingCategory = await prisma.contentCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (existingCategory) {
      res
        .status(400)
        .json({ message: "Une catégorie avec ce slug existe déjà" });
      return;
    }

    const newCategory = await prisma.contentCategory.create({
      data: {
        name,
        slug: categorySlug,
        description,
      },
    });

    res.status(201).json({
      message: "Catégorie créée avec succès",
      category: newCategory,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    const { name, slug, description } = req.body as UpdateCategoryData;

    const existingCategory = await prisma.contentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      res.status(404).json({ message: "Catégorie non trouvée" });
      return;
    }

    if (slug && slug !== existingCategory.slug) {
      const slugExists = await prisma.contentCategory.findUnique({
        where: { slug },
      });

      if (slugExists) {
        res
          .status(400)
          .json({ message: "Une catégorie avec ce slug existe déjà" });
        return;
      }
    }

    const updatedCategory = await prisma.contentCategory.update({
      where: { id: categoryId },
      data: {
        name: name !== undefined ? name : undefined,
        slug: slug !== undefined ? slug : undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    res.json({
      message: "Catégorie mise à jour avec succès",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);

    const existingCategory = await prisma.contentCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { contents: true },
        },
      },
    });

    if (!existingCategory) {
      res.status(404).json({ message: "Catégorie non trouvée" });
      return;
    }

    if (existingCategory._count.contents > 0) {
      res.status(400).json({
        message:
          "Impossible de supprimer cette catégorie car elle contient des contenus",
        count: existingCategory._count.contents,
      });
      return;
    }

    await prisma.contentCategory.delete({
      where: { id: categoryId },
    });

    res.json({ message: "Catégorie supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getCategoryContents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const categoryId = parseInt(id);
    const {
      page = 1,
      limit = 10,
      order = "desc",
      orderBy = "createdAt",
    } = req.query as unknown as PaginationParams;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const category = await prisma.contentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(404).json({ message: "Catégorie non trouvée" });
      return;
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where: { categoryId },
        skip,
        take: limitNumber,
        orderBy: {
          [orderBy]: order,
        },
      }),
      prisma.content.count({
        where: { categoryId },
      }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: contents,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      category,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des contenus de la catégorie:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
