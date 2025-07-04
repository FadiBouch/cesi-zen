import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { FaEdit, FaPlus, FaSearch } from "react-icons/fa";
import api from "../services/api";
import Loading from "../components/Loading";
import { useAuth } from "../contexts/AuthContext";

interface User {
  id: number;
  email: string;
  userName: string;
  firstName: string | null;
  lastName: string | null;
  role: "Admin" | "User";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleId?: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    password: "",
    role: "User",
    isActive: true,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.userName,
        email: user.email,
        firstname: user.firstName || "",
        lastname: user.lastName || "",
        password: "",
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setFormData({
        username: "",
        email: "",
        firstname: "",
        lastname: "",
        password: "",
        role: "User",
        isActive: true,
      });
    }
  }, [user, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = { ...formData };
    console.log("userName", dataToSubmit.username);

    if (!formData.password && user) {
      dataToSubmit.password = "";
    }
    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-500">
            {user ? "Modifier un utilisateur" : "Créer un utilisateur"}
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {user
                  ? "Nouveau mot de passe (laisser vide pour ne pas modifier)"
                  : "Mot de passe"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                required={!user}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rôle
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Compte actif
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
              className={`bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 ${
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

const UserManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { user: currentAuthUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      const response = await api.get(`/users`);

      return response.data;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: User) => api.post("/auth/register-admin", userData),
    onSuccess: () => {
      toast.success("Utilisateur créé avec succès");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la création de l'utilisateur"
      );
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: number; userData: any }) =>
      api.put(`/users/${id}`, userData),
    onSuccess: () => {
      toast.success("Utilisateur mis à jour avec succès");
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour de l'utilisateur"
      );
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      api.put(`/users/${id}/status`, { isActive }),
    onSuccess: () => {
      toast.success("Statut de l'utilisateur mis à jour");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la mise à jour du statut"
      );
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api.put(`/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success("Rôle de l'utilisateur mis à jour");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la mise à jour du rôle"
      );
    },
  });

  const handleSubmitUser = (data: any) => {
    if (currentUser) {
      updateUserMutation.mutate({ id: currentUser.id, userData: data });
    } else {
      createUserMutation.mutate(data);
    }
  };

  const toggleUserStatus = (user: User) => {
    if (user.id === currentAuthUser?.id) {
      toast.error("Vous ne pouvez pas désactiver votre propre compte");
      return;
    }
    toggleUserStatusMutation.mutate({ id: user.id, isActive: !user.isActive });
  };

  const toggleUserRole = (user: User) => {
    if (user.id === currentAuthUser?.id) {
      toast.error("Vous ne pouvez pas modifier votre propre rôle");
      return;
    }
    const newRole = user.role === "Admin" ? "User" : "Admin";
    updateUserRoleMutation.mutate({ id: user.id, role: newRole });
  };

  const handleEditUser = (user: User) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset page when searching
  };

  if (isLoading && page === 1) {
    return <Loading />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-xl font-semibold"></h1>
        <button
          onClick={handleAddUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Ajouter un utilisateur
        </button>
      </div>

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
              className="bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="Rechercher par nom ou email..."
            />
          </div>
          <button
            type="submit"
            className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Rechercher
          </button>
        </form>
      </div>

      {isError ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Une erreur est survenue lors du chargement des utilisateurs.
        </div>
      ) : (
        <>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Utilisateur
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rôle
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
                {usersData?.map((user: User) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserRole(user)}
                        disabled={true}
                        className={`px-2 py-1 inline-flex text-xs  leading-5 font-semibold rounded-full ${
                          user.roleId === 1
                            ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                        } ${
                          user.id === currentAuthUser?.id
                            ? "cursor-not-allowed opacity-50"
                            : "cursor"
                        }`}
                      >
                        {user.roleId === 1 ? "Admin" : "Utilisateur"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user)}
                        disabled={user.id === currentAuthUser?.id}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        } ${
                          user.id === currentAuthUser?.id
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer"
                        }`}
                      >
                        {user.isActive ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <FaEdit className="inline" /> Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData && (
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
                      {Math.min(page * limit, usersData.total)}
                    </span>{" "}
                    sur <span className="font-medium">{usersData.total}</span>{" "}
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
                      disabled={page >= Math.ceil(usersData.total / limit)}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        page >= Math.ceil(usersData.total / limit)
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={currentUser}
        onSubmit={handleSubmitUser}
        isLoading={createUserMutation.isPending || updateUserMutation.isPending}
      />
    </div>
  );
};

export default UserManagement;
