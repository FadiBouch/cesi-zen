import { Content, ContentCategory } from "@prisma/client";

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
  description?: string;
}

export interface CreateContentData {
  title: string;
  slug: string;
  content: string;
  published?: boolean;
  categoryId: number;
}

export interface UpdateContentData {
  title?: string;
  slug?: string;
  content?: string;
  published?: boolean;
  categoryId?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  order?: "asc" | "desc";
  orderBy?: string;
}
