import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";

interface Content {
  id: number;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

// Rich Text Editor Component (simplified for this example)
interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<EditorProps> = ({ value, onChange }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-64 p-2 border border-gray-300 rounded-md shadow-sm"
      placeholder="Contenu de l'article..."
    />
  );
};

// Modal for creating or editing content
interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  categories: Category[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const ContentModal: React.FC<ContentModalProps> = ({
  isOpen,
  onClose,
  content,
  categories,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    published: false,
    categoryId: 0,
  });

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title,
        slug: content.slug,
        content: content.content,
        published: content.published,
        categoryId: content.categoryId,
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        content: "",
        published: false,
        categoryId: categories.length > 0 ? categories[0].id : 0,
      });
    }
  }, [content, categories, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Auto-generate slug when title changes (only if not editing)
    if (name === "title" && !content) {
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

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold">
            {content ? "Modifier un contenu" : "Créer un contenu"}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Titre
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
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
                L'identifiant URL unique du contenu
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Catégorie
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Contenu
              </label>
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="published"
                checked={formData.published}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    published: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-purple-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Publier
              </label>
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
              className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-purple-700 ${
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
  content: Content | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  content,
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
            Êtes-vous sûr de vouloir supprimer le contenu{" "}
            <strong>{content?.title}</strong> ?
          </p>
          <p className="text-red-600">Cette action est irréversible.</p>
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

const ContentManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");
  const [publishedFilter, setPublishedFilter] = useState<boolean | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryIdParam = searchParams.get("categoryId");
    if (categoryIdParam) {
      setCategoryFilter(parseInt(categoryIdParam));
    }
  }, [categoryFilter, publishedFilter]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/content-categories");
      return response.data.data;
    },
  });

  const {
    data: contentsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "contents",
      page,
      limit,
      search,
      categoryFilter,
      publishedFilter,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("q", search);
      }

      if (categoryFilter !== "") {
        params.append("categoryId", categoryFilter.toString());
      }

      if (publishedFilter !== "") {
        params.append("published", publishedFilter.toString());
      }
      console.log("params");

      const response = await api.get(`/contents/search?${params.toString()}`);
      return response.data;
    },
  });

  const createContentMutation = useMutation({
    mutationFn: (contentData: any) => api.post("/contents", contentData),
    onSuccess: () => {
      toast.success("Contenu créé avec succès");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création du contenu"
      );
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, contentData }: { id: number; contentData: any }) =>
      api.put(`/contents/${id}`, contentData),
    onSuccess: () => {
      toast.success("Contenu mis à jour avec succès");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du contenu"
      );
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/contents/${id}`),
    onSuccess: () => {
      toast.success("Contenu supprimé avec succès");
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la suppression du contenu"
      );
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) =>
      api.patch(`/contents/${id}/publish`, { published }),
    onSuccess: (_, variables) => {
      toast.success(
        `Contenu ${variables.published ? "publié" : "dépublié"} avec succès`
      );
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la modification du statut"
      );
    },
  });

  const handleSubmitContent = (data: any) => {
    const formattedData = {
      ...data,
      categoryId: parseInt(data.categoryId),
    };

    if (currentContent) {
      updateContentMutation.mutate({
        id: currentContent.id,
        contentData: formattedData,
      });
    } else {
      createContentMutation.mutate(formattedData);
    }
  };

  const togglePublishStatus = (content: Content) => {
    togglePublishMutation.mutate({
      id: content.id,
      published: !content.published,
    });
  };

  const handleEditContent = (content: Content) => {
    setCurrentContent(content);
    setIsModalOpen(true);
  };

  const handleAddContent = () => {
    setCurrentContent(null);
    setIsModalOpen(true);
  };

  const handleDeleteContent = (content: Content) => {
    setCurrentContent(content);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteContent = () => {
    if (currentContent) {
      deleteContentMutation.mutate(currentContent.id);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page when searching
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setPublishedFilter("");
    navigate("/contents");
  };

  if (isLoading && page === 1) {
    return <Loading />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold"></h1>
        <button
          onClick={handleAddContent}
          className="text-black px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter un contenu
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg text-black font-medium mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <form onSubmit={handleSearch} className="flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 p-2.5"
                  placeholder="Rechercher par titre..."
                />
              </div>
              <button
                type="submit"
                className="ml-2 text-black px-4 py-2 rounded-md"
              >
                Rechercher
              </button>
            </form>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(
                  e.target.value ? parseInt(e.target.value) : ""
                )
              }
              className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
            >
              <option value="">Toutes les catégories</option>
              {categoriesData?.map((category: Category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={
                publishedFilter === "" ? "" : publishedFilter ? "true" : "false"
              }
              onChange={(e) => {
                if (e.target.value === "") {
                  setPublishedFilter("");
                } else {
                  setPublishedFilter(e.target.value === "true");
                }
              }}
              className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5"
            >
              <option value="">Tous les statuts</option>
              <option value="true">Publié</option>
              <option value="false">Brouillon</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={resetFilters}
            className="text-gray-600 hover:text-gray-900"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      {isError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Une erreur est survenue lors du chargement des contenus.
        </div>
      ) : (
        <>
          {/* Contents Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Titre
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Catégorie
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date de création
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
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
                {contentsData?.data?.map((content: Content) => (
                  <tr key={content.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {content.title}
                        </div>
                        <div className="ml-2 text-xs text-gray-500">
                          ({content.slug})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {content.category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(content.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePublishStatus(content)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          content.published
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {content.published ? (
                          <>
                            <FaEye className="mr-1" /> Publié
                          </>
                        ) : (
                          <>
                            <FaEyeSlash className="mr-1" /> Brouillon
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditContent(content)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit className="inline" /> Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="inline" /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {contentsData?.data?.length === 0 && (
              <div className="px-6 py-4 text-center text-gray-500">
                Aucun contenu trouvé. Ajoutez-en un nouveau ou modifiez vos
                filtres.
              </div>
            )}
          </div>

          {/* Pagination */}
          {contentsData && contentsData.data.length > 0 && (
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
                      {Math.min(page * limit, contentsData.total)}
                    </span>{" "}
                    sur{" "}
                    <span className="font-medium">{contentsData.total}</span>{" "}
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
                      disabled={page >= Math.ceil(contentsData.total / limit)}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        page >= Math.ceil(contentsData.total / limit)
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

      {/* Content Modal */}
      {categoriesData && (
        <ContentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          content={currentContent}
          categories={categoriesData}
          onSubmit={handleSubmitContent}
          isLoading={
            createContentMutation.isPending || updateContentMutation.isPending
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteContent}
        isLoading={deleteContentMutation.isPending}
        content={currentContent}
      />
    </div>
  );
};

export default ContentManagement;
