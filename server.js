const express = require("express");
const cors = require("cors");
const multer = require("multer");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const { recipeFlowchartSchema } = require("./schemas");

const app = express();
const port = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Recipe processing function
async function processRecipeToFlowchart(recipeText) {
  const systemPrompt = `You are a culinary expert who transforms recipes into structured flowcharts. 

Your task is to analyze a recipe and create a Mermaid flowchart that shows:
1. All ingredients as nodes (including their quantities)
2. All cooking actions as nodes that transform ingredients
3. The flow from raw ingredients to final dish
4. Timing and parallel actions where applicable

Rules for the flowchart:
- Ingredients are represented as rectangular nodes with square brackets: [Ingredient Name - Quantity]
- Actions are represented as rounded rectangular nodes with parentheses: (Action Name)
- Include timing information in action node labels using format: "Action Name - X min"
- Use different colors to distinguish ingredients from actions
- Actions take 1+ ingredient inputs and produce 1+ ingredient outputs
- Actions have duration (in minutes) - include this in the node label after a dash
- Parallel actions should be positioned in the same row
- If durations differ, position outputs accordingly
- Some actions might be "no-op" like "hold" or "warm up" that produce the same ingredient
- The final product is also an ingredient node
- IMPORTANT: Always include ingredient quantities in both the ingredient nodes and the structured data

IMPORTANT MERMAID SYNTAX REQUIREMENTS:
- Use simple node IDs without spaces or special characters (e.g., oil, toast_chilies, chili_oil)
- Apply styling using classDef at the end, not inline with ::: syntax
- Use this exact format:
  classDef ingredient fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
  classDef action fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
  classDef final fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000
- Apply classes using: class nodeId1,nodeId2,nodeId3 ingredient
- Keep node names simple and descriptive
- Ensure all node references are consistent throughout the diagram

Create a clear, logical flow that shows the transformation of ingredients through cooking steps.`;

  const userPrompt = `Please analyze this recipe and create a structured flowchart:

${recipeText}

Return the response in the exact JSON schema format with:
1. All ingredients with unique IDs, names, quantities, and descriptions
2. All actions with IDs, names, descriptions, durations, input/output ingredients
3. A complete Mermaid flowchart diagram

Focus on the logical flow and timing of the cooking process. Make sure to extract and include the exact quantities for each ingredient as specified in the recipe.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "recipe_flowchart",
          schema: recipeFlowchartSchema,
          strict: true,
        },
      },
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // Extract recipe name from the input text for better file naming
    const recipeName = recipeText
      .split("\n")[0]
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_");
    result.recipeName = recipeName || "recipe";

    return result;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to process recipe with OpenAI");
  }
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/process-recipe", async (req, res) => {
  try {
    const { recipeText } = req.body;

    if (!recipeText) {
      return res.status(400).json({ error: "Recipe text is required" });
    }

    const result = await processRecipeToFlowchart(recipeText);
    res.json(result);
  } catch (error) {
    console.error("Error processing recipe:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/upload-recipe",
  upload.single("recipeFile"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = req.file.path;
      const recipeText = fs.readFileSync(filePath, "utf8");

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      const result = await processRecipeToFlowchart(recipeText);
      res.json(result);
    } catch (error) {
      console.error("Error processing uploaded recipe:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Download Mermaid code endpoint
app.post("/api/download-mermaid", (req, res) => {
  try {
    const { mermaidCode, recipeName } = req.body;

    if (!mermaidCode) {
      return res.status(400).json({ error: "Mermaid code is required" });
    }

    const filename = `${recipeName || "recipe"}_flowchart.mmd`;

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(mermaidCode);
  } catch (error) {
    console.error("Error downloading Mermaid code:", error);
    res.status(500).json({ error: error.message });
  }
});

// Load example Mermaid file endpoint
app.get("/api/example-flowchart", (req, res) => {
  try {
    const examplePath = path.join(__dirname, "MAPO_TOFU_flowchart.mmd");

    if (!fs.existsSync(examplePath)) {
      return res
        .status(404)
        .json({ error: "Example flowchart file not found" });
    }

    const mermaidCode = fs.readFileSync(examplePath, "utf8");

    // Return just the Mermaid code and basic info
    const result = {
      mermaidDiagram: mermaidCode,
      recipeName: "MAPO_TOFU",
      ingredients: [],
      actions: [],
    };

    res.json(result);
  } catch (error) {
    console.error("Error loading example flowchart:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Recipe Flowchart Service running on port ${port}`);
  console.log(`Open http://localhost:${port} to access the web interface`);
});
