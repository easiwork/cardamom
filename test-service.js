// Test script for the Recipe Flowchart Service
const fs = require("fs");

// Read the example recipe
const recipeText = fs.readFileSync("recipe.txt", "utf8");

console.log("🧪 Recipe Flowchart Service Test");
console.log("================================");
console.log("");
console.log("📋 Recipe loaded from recipe.txt:");
console.log("Title:", recipeText.split("\n")[0]);
console.log("Total lines:", recipeText.split("\n").length);
console.log("");

// Test the schema
const { recipeFlowchartSchema } = require("./schemas");
console.log("✅ Schema loaded successfully");
console.log(
  "Schema properties:",
  Object.keys(recipeFlowchartSchema.properties)
);
console.log("");

console.log("🚀 To test the full service:");
console.log("1. Set your OpenAI API key in .env file");
console.log("2. Run: npm start");
console.log("3. Open: http://localhost:3000");
console.log('4. Click "Load Mapo Tofu Recipe" and "Generate Flowchart"');
console.log("");

console.log("📊 Expected output:");
console.log("- Ingredients list with IDs and descriptions");
console.log("- Actions with timing and input/output ingredients");
console.log("- Mermaid flowchart diagram");
console.log("");

console.log("🔧 API Endpoints:");
console.log("- POST /api/process-recipe (text input)");
console.log("- POST /api/upload-recipe (file upload)");
console.log("- GET /api/health (health check)");
