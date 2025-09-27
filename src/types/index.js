// Type definitions for the application

export const RecipeAction = {
  id: String,
  name: String,
  description: String,
  duration: Number, // in minutes
  inputIngredients: [String], // array of ingredient IDs
  outputIngredients: [String], // array of ingredient IDs
};

export const RecipeIngredient = {
  id: String,
  name: String,
  quantity: String,
  description: String,
};

export const RecipeData = {
  recipeName: String,
  ingredients: [RecipeIngredient],
  actions: [RecipeAction],
  mermaidDiagram: String,
  imageUrl: String,
  originalUrl: String,
  scrapedTitle: String,
};

export const SavedRecipe = {
  id: String,
  name: String,
  data: RecipeData,
  timestamp: String,
  deviceId: String,
};

export const ChatMessage = {
  role: String, // 'user' or 'assistant'
  content: String,
  timestamp: Date,
};
