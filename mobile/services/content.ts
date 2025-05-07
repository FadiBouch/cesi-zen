import { fetchWithToken } from "./api";
import { Content, Category } from "../types/content";

export const getAllContents = async (): Promise<Content[]> => {
  return fetchWithToken("/contents");
};

export const getContentBySlug = async (slug: string): Promise<Content> => {
  return fetchWithToken(`/contents/${slug}`);
};

export const getAllCategories = async (): Promise<Category[]> => {
  return fetchWithToken("/categories");
};

export const getCategoryBySlug = async (slug: string): Promise<Category> => {
  return fetchWithToken(`/categories/${slug}`);
};

export const getContentsByCategory = async (
  categorySlug: string
): Promise<Content[]> => {
  return fetchWithToken(`/categories/${categorySlug}/contents`);
};
