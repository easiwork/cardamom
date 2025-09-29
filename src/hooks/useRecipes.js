import { useState, useEffect, useCallback } from 'react';

// Default recipes to show when user has no saved recipes
const getDefaultRecipes = (deviceId) => {
  const now = new Date().toISOString();
  
  return [
    {
      id: 'default_recipe_1',
      name: 'Classic Chocolate Chip Cookies',
      data: {
        recipeName: 'Classic Chocolate Chip Cookies',
        ingredients: [
          { quantity: '2 1/4 cups', name: 'all-purpose flour' },
          { quantity: '1 tsp', name: 'baking soda' },
          { quantity: '1 tsp', name: 'salt' },
          { quantity: '1 cup', name: 'butter, softened' },
          { quantity: '3/4 cup', name: 'granulated sugar' },
          { quantity: '3/4 cup', name: 'brown sugar' },
          { quantity: '2 large', name: 'eggs' },
          { quantity: '2 tsp', name: 'vanilla extract' },
          { quantity: '2 cups', name: 'chocolate chips' }
        ],
        actions: [
          { action: 'Preheat oven to 375°F', time: '5 min' },
          { action: 'Mix flour, baking soda, and salt', time: '2 min' },
          { action: 'Cream butter and sugars', time: '3 min' },
          { action: 'Beat in eggs and vanilla', time: '2 min' },
          { action: 'Gradually blend in flour mixture', time: '3 min' },
          { action: 'Stir in chocolate chips', time: '1 min' },
          { action: 'Drop rounded tablespoons onto cookie sheets', time: '5 min' },
          { action: 'Bake 9-11 minutes until golden brown', time: '11 min' }
        ],
        mermaidDiagram: `graph TD
    A[Preheat oven to 375°F] --> B[Mix flour, baking soda, salt]
    B --> C[Cream butter and sugars]
    C --> D[Beat in eggs and vanilla]
    D --> E[Gradually blend in flour mixture]
    E --> F[Stir in chocolate chips]
    F --> G[Drop rounded tablespoons onto sheets]
    G --> H[Bake 9-11 minutes until golden]
    H --> I[Cool on wire rack]`,
        imageUrl: null
      },
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      deviceId: deviceId
    },
    {
      id: 'default_recipe_2',
      name: 'Simple Pasta Aglio e Olio',
      data: {
        recipeName: 'Simple Pasta Aglio e Olio',
        ingredients: [
          { quantity: '1 lb', name: 'spaghetti' },
          { quantity: '1/2 cup', name: 'extra virgin olive oil' },
          { quantity: '6 cloves', name: 'garlic, thinly sliced' },
          { quantity: '1/2 tsp', name: 'red pepper flakes' },
          { quantity: '1/2 cup', name: 'fresh parsley, chopped' },
          { quantity: '1/2 cup', name: 'Parmesan cheese, grated' },
          { quantity: 'to taste', name: 'salt and black pepper' }
        ],
        actions: [
          { action: 'Bring large pot of salted water to boil', time: '8 min' },
          { action: 'Cook spaghetti according to package directions', time: '10 min' },
          { action: 'Heat olive oil in large skillet', time: '2 min' },
          { action: 'Add garlic and red pepper flakes', time: '1 min' },
          { action: 'Cook until garlic is golden', time: '2 min' },
          { action: 'Add cooked pasta to skillet', time: '1 min' },
          { action: 'Toss with parsley and cheese', time: '1 min' },
          { action: 'Season with salt and pepper', time: '1 min' }
        ],
        mermaidDiagram: `graph TD
    A[Bring salted water to boil] --> B[Cook spaghetti]
    B --> C[Heat olive oil in skillet]
    C --> D[Add garlic and red pepper flakes]
    D --> E[Cook until garlic is golden]
    E --> F[Add cooked pasta to skillet]
    F --> G[Toss with parsley and cheese]
    G --> H[Season with salt and pepper]
    H --> I[Serve immediately]`,
        imageUrl: null
      },
      timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      deviceId: deviceId
    },
    {
      id: 'default_recipe_3',
      name: 'Perfect Scrambled Eggs',
      data: {
        recipeName: 'Perfect Scrambled Eggs',
        ingredients: [
          { quantity: '4 large', name: 'eggs' },
          { quantity: '2 tbsp', name: 'butter' },
          { quantity: '2 tbsp', name: 'heavy cream' },
          { quantity: 'to taste', name: 'salt and pepper' },
          { quantity: '1 tbsp', name: 'fresh chives, chopped' }
        ],
        actions: [
          { action: 'Crack eggs into bowl', time: '1 min' },
          { action: 'Add cream, salt, and pepper', time: '1 min' },
          { action: 'Whisk until well combined', time: '1 min' },
          { action: 'Heat butter in non-stick pan', time: '2 min' },
          { action: 'Pour in egg mixture', time: '1 min' },
          { action: 'Cook over low heat, stirring gently', time: '4 min' },
          { action: 'Remove from heat when still slightly wet', time: '1 min' },
          { action: 'Garnish with chives', time: '1 min' }
        ],
        mermaidDiagram: `graph TD
    A[Crack eggs into bowl] --> B[Add cream, salt, pepper]
    B --> C[Whisk until well combined]
    C --> D[Heat butter in pan]
    D --> E[Pour in egg mixture]
    E --> F[Cook over low heat, stirring gently]
    F --> G[Remove when still slightly wet]
    G --> H[Garnish with chives]
    H --> I[Serve immediately]`,
        imageUrl: null
      },
      timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      deviceId: deviceId
    }
  ];
};

// Custom hook for managing recipes
export const useRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentRecipe, setCurrentRecipe] = useState(null);
  const [currentRecipeId, setCurrentRecipeId] = useState(null);
  const [deviceId, setDeviceId] = useState(null);

  // Initialize device ID and load recipes
  useEffect(() => {
    initializeStorage();
  }, []);

  const initializeStorage = useCallback(() => {
    // Get device ID from cookies
    const cookies = document.cookie.split(';');
    let foundDeviceId = null;

    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'deviceId') {
        foundDeviceId = value;
        break;
      }
    }

    if (!foundDeviceId) {
      foundDeviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      document.cookie = `deviceId=${foundDeviceId}; max-age=${365 * 24 * 60 * 60}; path=/`;
    }

    setDeviceId(foundDeviceId);
    loadRecipes(foundDeviceId);
  }, []);

  const loadRecipes = useCallback((deviceId) => {
    if (!deviceId) return;

    const saved = localStorage.getItem(`savedRecipes_${deviceId}`);
    const savedRecipes = saved ? JSON.parse(saved) : [];
    
    // If no saved recipes, add some default recipes
    if (savedRecipes.length === 0) {
      const defaultRecipes = getDefaultRecipes(deviceId);
      setRecipes(defaultRecipes);
      localStorage.setItem(`savedRecipes_${deviceId}`, JSON.stringify(defaultRecipes));
    } else {
      setRecipes(savedRecipes);
    }
  }, []);

  const saveRecipe = useCallback((recipeData) => {
    console.log('💾 saveRecipe called with deviceId:', deviceId);
    if (!deviceId) {
      console.log('❌ No deviceId, cannot save recipe');
      return null;
    }

    const recipeId = 'recipe_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const recipeName = recipeData.recipeName || recipeData.scrapedTitle || 'Untitled Recipe';

    const recipeToSave = {
      id: recipeId,
      name: recipeName,
      data: recipeData,
      timestamp: new Date().toISOString(),
      deviceId: deviceId,
    };

    const updatedRecipes = [recipeToSave, ...recipes];
    
    // Keep only the last 50 recipes
    if (updatedRecipes.length > 50) {
      updatedRecipes.splice(50);
    }

    console.log('💾 Saving recipe to localStorage:', recipeToSave);
    localStorage.setItem(`savedRecipes_${deviceId}`, JSON.stringify(updatedRecipes));
    setRecipes(updatedRecipes);

    console.log('✅ Recipe saved successfully with ID:', recipeId);
    return recipeId;
  }, [deviceId, recipes]);

  const loadRecipe = useCallback((recipeId) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
      setCurrentRecipe(recipe.data);
      setCurrentRecipeId(recipeId);
    }
  }, [recipes]);

  const updateRecipe = useCallback((recipeId, updatedRecipeData) => {
    if (!deviceId) return false;

    console.log('🔄 Updating recipe with ID:', recipeId);
    console.log('📝 Updated recipe data:', updatedRecipeData);

    const updatedRecipes = recipes.map(recipe => {
      if (recipe.id === recipeId) {
        const updatedRecipe = {
          ...recipe,
          data: updatedRecipeData,
          name: updatedRecipeData.recipeName || updatedRecipeData.scrapedTitle || recipe.name,
          updatedAt: new Date().toISOString()
        };
        console.log('✅ Recipe updated:', updatedRecipe);
        return updatedRecipe;
      }
      return recipe;
    });

    localStorage.setItem(`savedRecipes_${deviceId}`, JSON.stringify(updatedRecipes));
    setRecipes(updatedRecipes);

    // If this is the currently loaded recipe, update it
    if (currentRecipeId === recipeId) {
      setCurrentRecipe(updatedRecipeData);
    }

    console.log('💾 Recipe update saved to localStorage');
    return true;
  }, [deviceId, recipes, currentRecipeId]);

  const deleteRecipe = useCallback((recipeId) => {
    if (!deviceId) return;

    const updatedRecipes = recipes.filter(r => r.id !== recipeId);
    localStorage.setItem(`savedRecipes_${deviceId}`, JSON.stringify(updatedRecipes));
    setRecipes(updatedRecipes);

    if (currentRecipeId === recipeId) {
      setCurrentRecipe(null);
      setCurrentRecipeId(null);
    }
  }, [deviceId, recipes, currentRecipeId]);

  const clearCurrentRecipe = useCallback(() => {
    setCurrentRecipe(null);
    setCurrentRecipeId(null);
  }, []);

  return {
    recipes,
    currentRecipe,
    currentRecipeId,
    deviceId,
    saveRecipe,
    loadRecipe,
    updateRecipe,
    deleteRecipe,
    clearCurrentRecipe,
  };
};
