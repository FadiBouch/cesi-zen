import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaFolder, FaTags } from "react-icons/fa";
import api from "../services/api";
import { toast } from "react-hot-toast";
import Loading from "../components/Loading";

interface DashboardStats {
  userCount: number;
  contentCount: number;
  categoryCount: number;
  latestUsers: any[];
  latestContents: any[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [usersResponse, contentsResponse, categoriesResponse] =
          await Promise.all([
            api.get("/users"),
            api.get("/contents?limit=5"),
            api.get("/content-categories"),
          ]);
        setStats({
          userCount: usersResponse.data.total || 0,
          contentCount: contentsResponse.data.total || 0,
          categoryCount: categoriesResponse.data.total || 0,
          latestUsers: usersResponse.data || [],
          latestContents: contentsResponse.data.data || [],
        });
      } catch (error) {
        console.log("Failed to fetch dashboard stats:", error);
        toast.error("Erreur lors du chargement des statistiques");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-lg">
              <FaUsers className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Utilisateurs</h2>
              <p className="text-2xl font-semibold">{stats?.userCount}</p>
            </div>
          </div>
          <Link
            to="/users"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700"
          >
            Voir tous les utilisateurs →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-lg">
              <FaTags className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Catégories</h2>
              <p className="text-2xl font-semibold">{stats?.categoryCount}</p>
            </div>
          </div>
          <Link
            to="/categories"
            className="mt-4 inline-block text-sm text-green-500 hover:text-green-700"
          >
            Voir toutes les catégories →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-lg">
              <FaFolder className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">Contenus</h2>
              <p className="text-2xl font-semibold">{stats?.contentCount}</p>
            </div>
          </div>
          <Link
            to="/contents"
            className="mt-4 inline-block text-sm text-purple-500 hover:text-purple-700"
          >
            Voir tous les contenus →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold">Utilisateurs récents</h3>
          </div>
          <div className="p-6">
            {stats?.latestUsers && stats.latestUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rôle
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.latestUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {user.userName}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.roleId === 1
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.roleId === 1 ? "Admin" : "Utilisateur"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucun utilisateur trouvé</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold">Contenus récents</h3>
          </div>
          <div className="p-6">
            {stats?.latestContents && stats.latestContents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Titre
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catégorie
                      </th>
                      <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stats.latestContents.map((content) => (
                      <tr key={content.id}>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {content.title}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {content.category?.name || "Non catégorisé"}
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              content.published
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {content.published ? "Publié" : "Brouillon"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">Aucun contenu trouvé</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow mt-6">
        <div className="border-b px-6 py-4">
          <h3 className="text-lg font-semibold">Actions rapides</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/users"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center"
          >
            <FaUsers className="text-blue-500 text-xl mx-auto mb-2" />
            <p className="text-blue-600 font-medium">Gérer les utilisateurs</p>
          </Link>
          <Link
            to="/categories"
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center"
          >
            <FaTags className="text-green-500 text-xl mx-auto mb-2" />
            <p className="text-green-600 font-medium">Gérer les catégories</p>
          </Link>
          <Link
            to="/contents"
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center"
          >
            <FaFolder className="text-purple-500 text-xl mx-auto mb-2" />
            <p className="text-purple-600 font-medium">Gérer les contenus</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
