import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="text-6xl font-bold text-blue-600 mb-4">404</div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Page non trouvée
      </h1>
      <p className="text-gray-600 mb-8 text-center">
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Retour à l'accueil
      </Link>
    </div>
  );
};

export default NotFound;
