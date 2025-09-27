import { useState, useEffect, useCallback } from 'react';

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
    setRecipes(savedRecipes);
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
    deleteRecipe,
    clearCurrentRecipe,
  };
};
