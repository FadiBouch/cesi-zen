// Contrôleur pour les contenus
import { Request, Response } from "express";
import prisma from "../utils/database";
import {
  CreateContentData,
  UpdateContentData,
  PaginationParams,
} from "../types/content";
import slugify from "slugify";

export const getAllContents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      order = "desc",
      orderBy = "createdAt",
      published,
    } = req.query as unknown as PaginationParams & { published?: string };

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where =
      published !== undefined
        ? {
            published: published === "true",
          }
        : {};

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          [orderBy]: order,
        },
        include: {
          category: true,
        },
      }),
      prisma.content.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: contents,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contenus:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getContentById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contentId = parseInt(id);

    const content = await prisma.content.findUnique({
      where: { id: contentId },
      include: {
        category: true,
      },
    });

    if (!content) {
      res.status(404).json({ message: "Contenu non trouvé" });
      return;
    }

    res.json(content);
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const getContentBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const content = await prisma.content.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!content) {
      res.status(404).json({ message: "Contenu non trouvé" });
      return;
    }

    res.json(content);
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const createContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      title,
      slug,
      content,
      published = false,
      categoryId,
    } = req.body as CreateContentData;

    const contentSlug = slug || slugify(title, { lower: true });

    const existingContent = await prisma.content.findUnique({
      where: { slug: contentSlug },
    });

    if (existingContent) {
      res.status(400).json({ message: "Un contenu avec ce slug existe déjà" });
      return;
    }

    const category = await prisma.contentCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400).json({ message: "La catégorie spécifiée n'existe pas" });
      return;
    }

    const newContent = await prisma.content.create({
      data: {
        title,
        slug: contentSlug,
        content,
        published,
        categoryId,
      },
      include: {
        category: true,
      },
    });

    res.status(201).json({
      message: "Contenu créé avec succès",
      content: newContent,
    });
  } catch (error) {
    console.error("Erreur lors de la création du contenu:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const updateContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contentId = parseInt(id);
    const { title, slug, content, published, categoryId } =
      req.body as UpdateContentData;

    const existingContent = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      res.status(404).json({ message: "Contenu non trouvé" });
      return;
    }

    if (slug && slug !== existingContent.slug) {
      const slugExists = await prisma.content.findUnique({
        where: { slug },
      });

      if (slugExists) {
        res
          .status(400)
          .json({ message: "Un contenu avec ce slug existe déjà" });
        return;
      }
    }

    if (categoryId) {
      const category = await prisma.contentCategory.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        res
          .status(400)
          .json({ message: "La catégorie spécifiée n'existe pas" });
        return;
      }
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content !== undefined) updateData.content = content;
    if (published !== undefined) updateData.published = published;
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: updateData,
      include: {
        category: true,
      },
    });

    res.json({
      message: "Contenu mis à jour avec succès",
      content: updatedContent,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contenu:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const deleteContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contentId = parseInt(id);

    const existingContent = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      res.status(404).json({ message: "Contenu non trouvé" });
      return;
    }

    await prisma.content.delete({
      where: { id: contentId },
    });

    res.json({ message: "Contenu supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du contenu:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const togglePublishStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const contentId = parseInt(id);
    const { published } = req.body as { published: boolean };

    const existingContent = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!existingContent) {
      res.status(404).json({ message: "Contenu non trouvé" });
      return;
    }

    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: { published },
      include: {
        category: true,
      },
    });

    const status = published ? "publié" : "dépublié";

    res.json({
      message: `Contenu ${status} avec succès`,
      content: updatedContent,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la modification du statut de publication:",
      error
    );
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

export const searchContents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      q,
      categoryId,
      page = 1,
      limit = 10,
      published,
    } = req.query as unknown as {
      q: string;
      categoryId?: string;
      page?: number;
      limit?: number;
      published?: string;
    };

    // if (!q) {
    //   res
    //     .status(400)
    //     .json({ message: "Le paramètre de recherche q est requis" });
    //   return;
    // }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      OR: [
        { title: { contains: q ? q : "", mode: "insensitive" } },
        { content: { contains: q ? q : "", mode: "insensitive" } },
      ],
    };

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (published !== undefined) {
      where.published = published === "true";
    }

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
        },
      }),
      prisma.content.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.json({
      data: contents,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages,
      query: q,
    });
  } catch (error) {
    console.error("Erreur lors de la recherche de contenus:", error);
    res.status(500).json({
      message: "Erreur serveur",
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
