const express = require("express");
const cors = require("cors");
const multer = require("multer");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
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

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`📡 ${timestamp} - ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Recipe processing function
async function processRecipeToFlowchart(recipeText) {
  console.log("🍳 Starting recipe processing...");
  console.log(`📝 Recipe text length: ${recipeText.length} characters`);
  console.log(`📝 Recipe preview: ${recipeText.substring(0, 200)}...`);
  
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
    console.log("🤖 Sending request to OpenAI API...");
    const startTime = Date.now();
    
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

    const apiResponseTime = Date.now() - startTime;
    console.log(`✅ OpenAI API response received in ${apiResponseTime}ms`);
    console.log(`📊 Token usage: ${completion.usage?.total_tokens || 'unknown'} tokens`);
    
    const result = JSON.parse(completion.choices[0].message.content);
    console.log("📋 Parsed result structure:");
    console.log(`  - Ingredients: ${result.ingredients?.length || 0} items`);
    console.log(`  - Actions: ${result.actions?.length || 0} items`);
    console.log(`  - Mermaid diagram length: ${result.mermaidDiagram?.length || 0} characters`);

    // Extract recipe name from the input text for better file naming
    const recipeName = recipeText
      .split("\n")[0]
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "_");
    result.recipeName = recipeName || "recipe";
    console.log(`📝 Extracted recipe name: "${result.recipeName}"`);
    
    // Log ingredient details
    if (result.ingredients && result.ingredients.length > 0) {
      console.log("🥘 Ingredients extracted:");
      result.ingredients.forEach((ingredient, index) => {
        console.log(`  ${index + 1}. ${ingredient.name} - ${ingredient.quantity || 'No quantity'}`);
      });
    }
    
    // Log action details
    if (result.actions && result.actions.length > 0) {
      console.log("👨‍🍳 Actions extracted:");
      result.actions.forEach((action, index) => {
        console.log(`  ${index + 1}. ${action.name} (${action.duration} min)`);
      });
    }
    
    console.log("🎉 Recipe processing completed successfully!");
    return result;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code
    });
    throw new Error("Failed to process recipe with OpenAI");
  }
}

// URL scraping function
async function scrapeRecipeFromURL(url) {
  console.log("🌐 Starting URL scraping...");
  console.log(`🔗 Target URL: ${url}`);
  
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }
    console.log(`✅ URL validation passed: ${urlObj.protocol}//${urlObj.hostname}`);

    // Fetch the webpage
    console.log("📡 Fetching webpage...");
    const fetchStartTime = Date.now();
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const fetchTime = Date.now() - fetchStartTime;
    console.log(`✅ Webpage fetched in ${fetchTime}ms (${response.data.length} characters)`);
    console.log(`📊 Response status: ${response.status} ${response.statusText}`);

    const $ = cheerio.load(response.data);

    // Try to find recipe content using common selectors
    let recipeText = '';

    // Common recipe selectors for popular sites
    const recipeSelectors = [
      '[itemtype*="Recipe"]',
      '[itemtype*="recipe"]',
      '.recipe',
      '.recipe-content',
      '.recipe-instructions',
      '.recipe-ingredients',
      '.entry-content',
      '.post-content',
      '.content',
      'article',
      '.recipe-card',
      '.recipe-details'
    ];

    let recipeElement = null;
    for (const selector of recipeSelectors) {
      recipeElement = $(selector).first();
      if (recipeElement.length > 0) {
        break;
      }
    }

    if (recipeElement.length === 0) {
      // Fallback: try to get the main content area
      recipeElement = $('main, .main, #main, .content, #content').first();
      if (recipeElement.length === 0) {
        recipeElement = $('body');
      }
    }

    // Extract text content, preserving structure
    recipeElement.find('script, style, nav, header, footer, .ad, .advertisement, .ads').remove();
    
    // Get the title
    const title = $('h1').first().text().trim() || 
                  $('title').text().trim() || 
                  'Recipe from URL';
    console.log(`📝 Extracted title: "${title}"`);

    // Extract ingredients
    console.log("🥘 Extracting ingredients...");
    const ingredients = [];
    $('[itemprop="ingredients"], .ingredient, .recipe-ingredient, li').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0 && text.length < 200) {
        ingredients.push(text);
      }
    });
    console.log(`✅ Found ${ingredients.length} potential ingredients`);

    // Extract instructions
    console.log("👨‍🍳 Extracting instructions...");
    const instructions = [];
    $('[itemprop="recipeInstructions"], .instruction, .recipe-instruction, .step, ol li').each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0 && text.length < 500) {
        instructions.push(text);
      }
    });
    console.log(`✅ Found ${instructions.length} potential instructions`);

    // Build recipe text
    recipeText = title + '\n\n';
    
    if (ingredients.length > 0) {
      recipeText += 'INGREDIENTS\n';
      ingredients.forEach(ingredient => {
        recipeText += `▢ ${ingredient}\n`;
      });
      recipeText += '\n';
    }

    if (instructions.length > 0) {
      recipeText += 'INSTRUCTIONS\n\n';
      instructions.forEach((instruction, index) => {
        recipeText += `${index + 1}. ${instruction}\n\n`;
      });
    }

    // If we couldn't extract structured content, get all text
    if (recipeText.length < 100) {
      recipeText = recipeElement.text().trim();
    }

    // Clean up the text
    recipeText = recipeText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    if (recipeText.length < 50) {
      throw new Error('Could not extract sufficient recipe content from the URL. The page may not contain a recipe or may be protected.');
    }

    console.log(`📄 Final recipe text length: ${recipeText.length} characters`);
    console.log(`📄 Recipe preview: ${recipeText.substring(0, 200)}...`);
    console.log("🎉 URL scraping completed successfully!");

    return {
      title: title,
      content: recipeText,
      url: url
    };

  } catch (error) {
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Could not connect to the URL. Please check if the URL is correct and accessible.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The website took too long to respond.');
    } else if (error.message.includes('Invalid URL')) {
      throw new Error(error.message);
    } else {
      throw new Error(`Failed to scrape recipe from URL: ${error.message}`);
    }
  }
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/process-recipe", async (req, res) => {
  const requestId = Date.now().toString(36);
  console.log(`\n📥 [${requestId}] New recipe processing request`);
  console.log(`📥 [${requestId}] Request body size: ${JSON.stringify(req.body).length} characters`);
  
  try {
    const { recipeText } = req.body;

    if (!recipeText) {
      console.log(`❌ [${requestId}] Missing recipe text`);
      return res.status(400).json({ error: "Recipe text is required" });
    }

    console.log(`✅ [${requestId}] Starting recipe processing...`);
    const result = await processRecipeToFlowchart(recipeText);
    
    console.log(`🎉 [${requestId}] Recipe processing completed successfully`);
    console.log(`📤 [${requestId}] Sending response with ${result.ingredients?.length || 0} ingredients and ${result.actions?.length || 0} actions`);
    
    res.json(result);
  } catch (error) {
    console.error(`❌ [${requestId}] Error processing recipe:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/process-recipe-url", async (req, res) => {
  const requestId = Date.now().toString(36);
  console.log(`\n🌐 [${requestId}] New recipe URL processing request`);
  
  try {
    const { recipeUrl } = req.body;

    if (!recipeUrl) {
      console.log(`❌ [${requestId}] Missing recipe URL`);
      return res.status(400).json({ error: "Recipe URL is required" });
    }

    console.log(`🔗 [${requestId}] Processing URL: ${recipeUrl}`);

    // Scrape the recipe from the URL
    const scrapedRecipe = await scrapeRecipeFromURL(recipeUrl);
    console.log(`✅ [${requestId}] URL scraping completed`);
    
    // Process the scraped recipe
    console.log(`🤖 [${requestId}] Starting AI processing of scraped content...`);
    const result = await processRecipeToFlowchart(scrapedRecipe.content);
    
    // Add the original URL and scraped title to the result
    result.originalUrl = scrapedRecipe.url;
    result.scrapedTitle = scrapedRecipe.title;
    
    console.log(`🎉 [${requestId}] Recipe URL processing completed successfully`);
    console.log(`📤 [${requestId}] Sending response with ${result.ingredients?.length || 0} ingredients and ${result.actions?.length || 0} actions`);
    
    res.json(result);
  } catch (error) {
    console.error(`❌ [${requestId}] Error processing recipe URL:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post(
  "/api/upload-recipe",
  upload.single("recipeFile"),
  async (req, res) => {
    const requestId = Date.now().toString(36);
    console.log(`\n📁 [${requestId}] New file upload request`);
    
    try {
      if (!req.file) {
        console.log(`❌ [${requestId}] No file uploaded`);
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log(`📁 [${requestId}] File uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
      const filePath = req.file.path;
      const recipeText = fs.readFileSync(filePath, "utf8");

      // Clean up uploaded file
      fs.unlinkSync(filePath);
      console.log(`🗑️ [${requestId}] Temporary file cleaned up`);

      console.log(`✅ [${requestId}] Starting recipe processing...`);
      const result = await processRecipeToFlowchart(recipeText);
      
      console.log(`🎉 [${requestId}] File upload processing completed successfully`);
      console.log(`📤 [${requestId}] Sending response with ${result.ingredients?.length || 0} ingredients and ${result.actions?.length || 0} actions`);
      
      res.json(result);
    } catch (error) {
      console.error(`❌ [${requestId}] Error processing uploaded recipe:`, error.message);
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
  const healthData = { 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: "1.0.0"
  };
  console.log("💚 Health check requested");
  res.json(healthData);
});

app.listen(port, () => {
  console.log("\n🚀 ================================================");
  console.log("🍳 Recipe Flowchart Service Started Successfully!");
  console.log("🚀 ================================================");
  console.log(`🌐 Server running on port ${port}`);
  console.log(`🔗 Web interface: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log("📝 Features enabled:");
  console.log("   ✅ Recipe text processing");
  console.log("   ✅ File upload processing");
  console.log("   ✅ URL scraping and processing");
  console.log("   ✅ Ingredient quantity extraction");
  console.log("   ✅ Comprehensive logging");
  console.log("🚀 ================================================\n");
});
