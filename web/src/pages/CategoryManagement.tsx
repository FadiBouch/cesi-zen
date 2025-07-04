import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus, FaSearch, FaFolder } from "react-icons/fa";
import api from "../services/api";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    contents: number;
  };
}

// Modal for creating or editing a category
interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  React.useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
      });
    } else {
      // Reset form for new category
      setFormData({
        name: "",
        slug: "",
        description: "",
      });
    }
  }, [category, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug when name changes (only if not editing)
    if (name === "name" && !category) {
      setFormData((prev) => ({
        ...prev,
        slug: value
          .toLowerCase()
          .replace(/[^\w\s-]/g, "") // Remove special chars
          .replace(/\s+/g, "-") // Replace spaces with hyphens
          .replace(/-+/g, "-"), // Remove consecutive hyphens
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold">
            {category ? "Modifier une catégorie" : "Créer une catégorie"}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Slug
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                L'identifiant URL unique de la catégorie
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Chargement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete confirmation modal
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  category: Category | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  category,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-red-600">
            Confirmer la suppression
          </h3>
        </div>
        <div className="p-6">
          <p className="mb-4">
            Êtes-vous sûr de vouloir supprimer la catégorie{" "}
            <strong>{category?.name}</strong> ?
          </p>
          {category?._count && category._count.contents > 0 && (
            <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
              <p className="font-medium">Attention !</p>
              <p>
                Cette catégorie contient {category._count.contents} contenu(s).
                La suppression de cette catégorie entraînera la suppression de
                tous les contenus associés.
              </p>
            </div>
          )}
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component
const CategoryManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await api.get(
        `/content-categories?${params.toString()}`
      );
      return response.data;
    },
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (categoryData: any) =>
      api.post("/content-categories", categoryData),
    onSuccess: () => {
      toast.success("Catégorie créée avec succès");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création de la catégorie"
      );
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, categoryData }: { id: number; categoryData: any }) =>
      api.put(`/content-categories/${id}`, categoryData),
    onSuccess: () => {
      toast.success("Catégorie mise à jour avec succès");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de la catégorie"
      );
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/content-categories/${id}`),
    onSuccess: () => {
      toast.success("Catégorie supprimée avec succès");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression de la catégorie"
      );
    },
  });

  // Handle form submission (create or update)
  const handleSubmitCategory = (data: any) => {
    if (currentCategory) {
      updateCategoryMutation.mutate({
        id: currentCategory.id,
        categoryData: data,
      });
    } else {
      createCategoryMutation.mutate(data);
    }
  };

  // Open modal to edit category
  const handleEditCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };

  // Open modal to create new category
  const handleAddCategory = () => {
    setCurrentCategory(null);
    setIsModalOpen(true);
  };

  // Open delete confirmation modal
  const handleDeleteCategory = (category: Category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDeleteCategory = () => {
    if (currentCategory) {
      deleteCategoryMutation.mutate(currentCategory.id);
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page when searching
  };

  // View category contents
  const viewCategoryContents = (categoryId: number) => {
    navigate(`/contents?categoryId=${categoryId}`);
  };

  if (isLoading && page === 1) {
    return <Loading />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold">Gestion des Catégories</h1>
        <button
          onClick={handleAddCategory}
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter une catégorie
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5"
              placeholder="Rechercher par nom..."
            />
          </div>
          <button
            type="submit"
            className="ml-2 bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Rechercher
          </button>
        </form>
      </div>

      {isError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Une erreur est survenue lors du chargement des catégories.
        </div>
      ) : (
        <>
          {/* Categories Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nom
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Slug
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Contenus
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoriesData?.data?.map((category: Category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      {category.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {category.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewCategoryContents(category.id)}
                        className="text-sm text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FaFolder className="mr-1" />{" "}
                        {category._count?.contents || 0} contenus
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit className="inline" /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline" /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {categoriesData && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Affichage de{" "}
                    <span className="font-medium">
                      {(page - 1) * limit + 1}
                    </span>{" "}
                    à{" "}
                    <span className="font-medium">
                      {Math.min(page * limit, categoriesData.total)}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium">{categoriesData.total}</span>{" "}
                    résultats
                  </p>
                </div>
                <div>
                  <nav
                    className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                    aria-label="Pagination"
                  >
                    <button
                      onClick={() => setPage(page > 1 ? page - 1 : 1)}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        page === 1 ? "cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="sr-only">Précédent</span>
                      &larr;
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(categoriesData.total / limit)}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        page >= Math.ceil(categoriesData.total / limit)
                          ? "cursor-not-allowed"
                          : ""
                      }`}
                    >
                      <span className="sr-only">Suivant</span>
                      &rarr;
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={currentCategory}
        onSubmit={handleSubmitCategory}
        isLoading={
          createCategoryMutation.isPending || updateCategoryMutation.isPending
        }
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteCategory}
        isLoading={deleteCategoryMutation.isPending}
        category={currentCategory}
      />
    </div>
  );
};

export default CategoryManagement;
