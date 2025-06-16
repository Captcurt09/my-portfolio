import React, { useState } from 'react';
import { FaSearch, FaHeart, FaRegHeart, FaClock, FaUtensils } from 'react-icons/fa';

// Sample recipes for fallback
const sampleRecipes = [
  {
    id: 1,
    title: "Classic Margherita Pizza",
    image: "https://spoonacular.com/recipeImages/716429-556x370.jpg",
    readyInMinutes: 30,
    servings: 4,
    summary: "A simple and delicious pizza with fresh tomatoes, mozzarella, and basil.",
    sourceUrl: "https://spoonacular.com/recipes/classic-margherita-pizza-716429"
  },
  {
    id: 2,
    title: "Chocolate Chip Cookies",
    image: "https://spoonacular.com/recipeImages/716429-556x370.jpg",
    readyInMinutes: 45,
    servings: 24,
    summary: "Classic homemade chocolate chip cookies that are soft and chewy.",
    sourceUrl: "https://spoonacular.com/recipes/chocolate-chip-cookies-716429"
  },
  {
    id: 3,
    title: "Grilled Chicken Salad",
    image: "https://spoonacular.com/recipeImages/716429-556x370.jpg",
    readyInMinutes: 25,
    servings: 2,
    summary: "Healthy grilled chicken salad with fresh vegetables and a light dressing.",
    sourceUrl: "https://spoonacular.com/recipes/grilled-chicken-salad-716429"
  }
];

const RecipeFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [usingSampleData, setUsingSampleData] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setUsingSampleData(false);

    try {
      const apiKey = import.meta.env.VITE_SPOONACULAR_API_KEY || 'bc5894526d0e4efb936dd2332589c630';
      console.log('Using API Key:', apiKey ? 'Present' : 'Missing');
      
      const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${searchQuery}&number=12&addRecipeInformation=true`;
      console.log('API URL:', url);

      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch recipes');
      }

      const data = await response.json();
      console.log('Recipes data:', data);
      setRecipes(data.results);
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to fetch recipes. Using sample data instead.');
      setRecipes(sampleRecipes);
      setUsingSampleData(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (recipeId) => {
    setFavorites(prev => 
      prev.includes(recipeId)
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Recipe Finder
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for recipes..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaSearch />
              Search
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-100 text-yellow-700 rounded-lg">
            {error}
            {usingSampleData && (
              <p className="mt-2 text-sm">
                Note: You're currently viewing sample recipes. Please check your API key configuration.
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative">
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(recipe.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  {favorites.includes(recipe.id) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart className="text-gray-400" />
                  )}
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {recipe.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <FaClock />
                    <span>{recipe.readyInMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaUtensils />
                    <span>{recipe.servings} servings</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {recipe.summary.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Recipe
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {!loading && recipes.length === 0 && searchQuery && !usingSampleData && (
          <div className="text-center py-8 text-gray-600">
            No recipes found. Try a different search term.
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeFinder; 