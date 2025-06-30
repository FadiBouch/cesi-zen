import { fetchWithToken } from "./api";
import { Content, Category } from "../types/content";

export const getAllContents = async () => {
  return fetchWithToken("/contents");
};

export const getContentBySlug = async (slug: string) => {
  return fetchWithToken(`/contents/slug/${slug}`);
};

export const getAllCategories = async () => {
  return fetchWithToken("/content-categories");
};

export const getCategoryBySlug = async (slug: string) => {
  return fetchWithToken(`/content-categories/${slug}`);
};

export const getContentsByCategory = async (categorySlug: string) => {
  return fetchWithToken(`/content-categories/${categorySlug}/contents`);
};
