const express = require("express");
const cors = require("cors");
const multer = require("multer");
const OpenAI = require("openai");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenAI } = require("@google/genai");
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
app.use(cookieParser());
// Serve static files - React build in production, public folder in development
if (process.env.NODE_ENV === 'production') {
  app.use(express.static("dist"));
} else {
  app.use(express.static("public"));
}

// Device ID middleware - ensures each device has a unique identifier
app.use((req, res, next) => {
  if (!req.cookies.deviceId) {
    const deviceId = uuidv4();
    res.cookie("deviceId", deviceId, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      httpOnly: false, // Allow client-side access for localStorage
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
    });
    req.deviceId = deviceId;
    console.log(`🆔 New device ID assigned: ${deviceId}`);
  } else {
    req.deviceId = req.cookies.deviceId;
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `📡 ${timestamp} - ${req.method} ${req.path} - ${
      req.ip
    } - Device: ${req.deviceId?.substring(0, 8)}...`
  );
  next();
});

// Configure multer for file uploads
const upload = multer({ dest: "uploads/" });

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// General chat function for cooking questions
async function processCookingChat(message, conversationHistory = []) {
  console.log("💬 Processing cooking chat...");
  console.log(`📝 Message: ${message}`);
  console.log(
    `📚 Conversation history: ${conversationHistory.length} messages`
  );

  const systemPrompt = `You are a helpful cooking assistant and culinary expert for Cardamom Recipe Vault. You can help with:
- Cooking techniques and tips
- Ingredient substitutions
- Recipe modifications
- Food safety questions
- Kitchen equipment advice
- Meal planning suggestions
- Nutritional information
- Cooking troubleshooting

Provide helpful, accurate, and practical advice. Be conversational and friendly. If someone asks about creating a recipe flowchart, suggest they share a recipe URL or paste recipe text.

IMPORTANT: You have access to the conversation history. Use this context to provide more relevant and personalized responses. If the user is asking about a specific recipe that was mentioned earlier, refer to that recipe and provide specific advice based on the ingredients and steps that were discussed.`;

  try {
    console.log("🤖 Sending chat request to OpenAI API...");
    const startTime = Date.now();

    // Build messages array with system prompt, conversation history, and current message
    const messages = [{ role: "system", content: systemPrompt }];

    // Add conversation history (limit to last 10 messages to stay within token limits)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      // Clean HTML tags from content for better context
      const cleanContent = msg.content.replace(/<[^>]*>/g, "").trim();
      if (cleanContent) {
        messages.push({
          role: msg.role,
          content: cleanContent,
        });
      }
    }

    // Add current message
    messages.push({ role: "user", content: message });

    console.log(`📤 Sending ${messages.length} messages to OpenAI`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
    });

    const apiResponseTime = Date.now() - startTime;
    console.log(`✅ OpenAI API response received in ${apiResponseTime}ms`);
    console.log(
      `📊 Token usage: ${completion.usage?.total_tokens || "unknown"} tokens`
    );

    const response = completion.choices[0].message.content;
    console.log("🎉 Chat processing completed successfully!");

    return {
      response: response,
      type: "chat",
    };
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    throw new Error("Failed to process chat message with OpenAI");
  }
}

// Image generation function using Nano Banana (Google GenAI)
async function generateRecipeImage(recipeData) {
  console.log("🎨 Starting recipe image generation with Nano Banana...");

  try {
    // Check if API key is available
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.log("⚠️ No Google AI API key found, skipping image generation");
      return null;
    }

    // Create a descriptive prompt based on the recipe
    const recipeName =
      recipeData.recipeName || recipeData.scrapedTitle || "delicious dish";
    const ingredients = recipeData.ingredients || [];

    // Build a descriptive prompt for Nano Banana
    let prompt = `Create a cute, animated illustration of ${recipeName}`;

    if (ingredients.length > 0) {
      const mainIngredients = ingredients
        .slice(0, 5)
        .map((ing) => ing.name)
        .join(", ");
      prompt += ` featuring ${mainIngredients}`;
    }

    prompt += `. The dish should be drawn in a kawaii, chibi, soft colors. Think Studio Ghibli meets food illustration - whimsical, charming, and endearing. Bright, cheerful colors, rounded shapes, and a playful, animated aesthetic. Do not anthropomorphize the food. The food should look like food.`;

    console.log(`🎨 Generated prompt: ${prompt}`);

    // Initialize Google GenAI
    const ai = new GoogleGenAI({ apiKey });

    console.log("🤖 Calling Nano Banana API...");
    const startTime = Date.now();

    // Generate image using Nano Banana
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    const apiResponseTime = Date.now() - startTime;
    console.log(`✅ Nano Banana response received in ${apiResponseTime}ms`);

    // Extract image data from response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");

        // Create images directory if it doesn't exist
        const imagesDir = path.join(__dirname, "public", "images");
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Generate unique filename
        const filename = `recipe_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.png`;
        const filepath = path.join(imagesDir, filename);

        // Save image to file
        fs.writeFileSync(filepath, buffer);

        // Return the public URL for the image
        const imageUrl = `/images/${filename}`;
        console.log(`🎉 Image generated successfully: ${imageUrl}`);
        return imageUrl;
      }
    }

    throw new Error("No image data received from Nano Banana");
  } catch (error) {
    console.error("❌ Nano Banana Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
    });

    // Return null if image generation fails - we'll handle this gracefully
    console.log("⚠️ Image generation failed, continuing without image");
    return null;
  }
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
1. A descriptive, human-readable recipe name that captures the essence of the dish (e.g., "Classic Chocolate Chip Cookies", "Spicy Thai Basil Chicken", "Creamy Mushroom Risotto")
2. All ingredients with unique IDs, names, quantities, and descriptions
3. All actions with IDs, names, descriptions, durations, input/output ingredients
4. A complete Mermaid flowchart diagram

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
    console.log(
      `📊 Token usage: ${completion.usage?.total_tokens || "unknown"} tokens`
    );

    const result = JSON.parse(completion.choices[0].message.content);
    console.log("📋 Parsed result structure:");
    console.log(`  - Recipe name: "${result.recipeName || "Not provided"}"`);
    console.log(`  - Ingredients: ${result.ingredients?.length || 0} items`);
    console.log(`  - Actions: ${result.actions?.length || 0} items`);
    console.log(
      `  - Mermaid diagram length: ${
        result.mermaidDiagram?.length || 0
      } characters`
    );

    // Ensure we have a recipe name (fallback to extracted name if AI didn't provide one)
    if (!result.recipeName) {
      const fallbackName = recipeText
        .split("\n")[0]
        .trim()
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_");
      result.recipeName = fallbackName || "recipe";
      console.log(`📝 Using fallback recipe name: "${result.recipeName}"`);
    } else {
      console.log(`📝 AI-generated recipe name: "${result.recipeName}"`);
    }

    // Log ingredient details
    if (result.ingredients && result.ingredients.length > 0) {
      console.log("🥘 Ingredients extracted:");
      result.ingredients.forEach((ingredient, index) => {
        console.log(
          `  ${index + 1}. ${ingredient.name} - ${
            ingredient.quantity || "No quantity"
          }`
        );
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

    // Generate image for the recipe
    try {
      console.log("🎨 Starting image generation...");
      const imageUrl = await generateRecipeImage(result);
      if (imageUrl) {
        result.imageUrl = imageUrl;
        console.log("✅ Image generated and added to recipe data");
      }
    } catch (imageError) {
      console.error("⚠️ Image generation failed:", imageError.message);
      // Continue without image - don't fail the entire recipe processing
    }

    return result;
  } catch (error) {
    console.error("❌ OpenAI API Error:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      code: error.code,
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
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      throw new Error(
        "Invalid URL protocol. Only HTTP and HTTPS are supported."
      );
    }
    console.log(
      `✅ URL validation passed: ${urlObj.protocol}//${urlObj.hostname}`
    );

    // Fetch the webpage
    console.log("📡 Fetching webpage...");
    const fetchStartTime = Date.now();

    // Try multiple user agents and headers to avoid 403 errors
    const userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15"
    ];

    let response;
    let lastError;

    for (let i = 0; i < userAgents.length; i++) {
      try {
        console.log(`🔄 Attempt ${i + 1}/${userAgents.length} with User-Agent: ${userAgents[i].substring(0, 50)}...`);
        
        response = await axios.get(url, {
          timeout: 15000,
          headers: {
            "User-Agent": userAgents[i],
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Cache-Control": "max-age=0"
          },
          maxRedirects: 5,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // Accept redirects
          }
        });
        
        console.log(`✅ Success with attempt ${i + 1}`);
        break; // Success, exit the loop
        
      } catch (error) {
        lastError = error;
        console.log(`❌ Attempt ${i + 1} failed: ${error.response?.status} ${error.response?.statusText || error.message}`);
        
        // If we get a 403, try the next user agent
        if (error.response?.status === 403 && i < userAgents.length - 1) {
          console.log(`🔄 403 Forbidden, trying next user agent...`);
          // Add a small delay between attempts
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        // If it's not a 403 or we've tried all user agents, throw the error
        throw error;
      }
    }

    if (!response) {
      throw lastError || new Error("All scraping attempts failed");
    }

    const fetchTime = Date.now() - fetchStartTime;
    console.log(
      `✅ Webpage fetched in ${fetchTime}ms (${response.data.length} characters)`
    );
    console.log(
      `📊 Response status: ${response.status} ${response.statusText}`
    );

    const $ = cheerio.load(response.data);

    // Try to find recipe content using common selectors
    let recipeText = "";

    // Common recipe selectors for popular sites
    const recipeSelectors = [
      '[itemtype*="Recipe"]',
      '[itemtype*="recipe"]',
      ".recipe",
      ".recipe-content",
      ".recipe-instructions",
      ".recipe-ingredients",
      ".entry-content",
      ".post-content",
      ".content",
      "article",
      ".recipe-card",
      ".recipe-details",
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
      recipeElement = $("main, .main, #main, .content, #content").first();
      if (recipeElement.length === 0) {
        recipeElement = $("body");
      }
    }

    // Extract text content, preserving structure
    recipeElement
      .find("script, style, nav, header, footer, .ad, .advertisement, .ads")
      .remove();

    // Get the title
    const title =
      $("h1").first().text().trim() ||
      $("title").text().trim() ||
      "Recipe from URL";
    console.log(`📝 Extracted title: "${title}"`);

    // Extract ingredients
    console.log("🥘 Extracting ingredients...");
    const ingredients = [];
    $('[itemprop="ingredients"], .ingredient, .recipe-ingredient, li').each(
      (i, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 0 && text.length < 200) {
          ingredients.push(text);
        }
      }
    );
    console.log(`✅ Found ${ingredients.length} potential ingredients`);

    // Extract instructions
    console.log("👨‍🍳 Extracting instructions...");
    const instructions = [];
    $(
      '[itemprop="recipeInstructions"], .instruction, .recipe-instruction, .step, ol li'
    ).each((i, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0 && text.length < 500) {
        instructions.push(text);
      }
    });
    console.log(`✅ Found ${instructions.length} potential instructions`);

    // Build recipe text
    recipeText = title + "\n\n";

    if (ingredients.length > 0) {
      recipeText += "INGREDIENTS\n";
      ingredients.forEach((ingredient) => {
        recipeText += `▢ ${ingredient}\n`;
      });
      recipeText += "\n";
    }

    if (instructions.length > 0) {
      recipeText += "INSTRUCTIONS\n\n";
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
      .replace(/\s+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    if (recipeText.length < 50) {
      throw new Error(
        "Could not extract sufficient recipe content from the URL. The page may not contain a recipe or may be protected."
      );
    }

    console.log(`📄 Final recipe text length: ${recipeText.length} characters`);
    console.log(`📄 Recipe preview: ${recipeText.substring(0, 200)}...`);
    console.log("🎉 URL scraping completed successfully!");

    return {
      title: title,
      content: recipeText,
      url: url,
    };
  } catch (error) {
    if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      throw new Error(
        "Could not connect to the URL. Please check if the URL is correct and accessible."
      );
    } else if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. The website took too long to respond.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied (403 Forbidden). This website blocks automated requests. Please try copying and pasting the recipe text directly instead."
      );
    } else if (error.response?.status === 429) {
      throw new Error(
        "Too many requests (429). The website is rate limiting requests. Please wait a moment and try again."
      );
    } else if (error.response?.status === 404) {
      throw new Error(
        "Recipe not found (404). The URL may be incorrect or the recipe may have been removed."
      );
    } else if (error.response?.status >= 500) {
      throw new Error(
        `Server error (${error.response.status}). The website is experiencing issues. Please try again later.`
      );
    } else if (error.message.includes("Invalid URL")) {
      throw new Error(error.message);
    } else {
      throw new Error(`Failed to scrape recipe from URL: ${error.message}`);
    }
  }
}

// Routes
app.get("/", (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  } else {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// Route to handle direct recipe URL processing via path parameter
app.get("/api/process-url/*", async (req, res) => {
  const requestId = Date.now().toString(36);
  console.log(`\n🌐 [${requestId}] Direct URL processing request`);

  try {
    // Extract the URL from the path (everything after /api/process-url/)
    const urlPath = req.params[0]; // This captures everything after the route
    const recipeUrl = decodeURIComponent(urlPath);

    if (!recipeUrl) {
      console.log(`❌ [${requestId}] Missing URL in path`);
      return res
        .status(400)
        .json({ error: "Recipe URL is required in the path" });
    }

    console.log(`🔗 [${requestId}] Processing URL: ${recipeUrl}`);

    // Validate URL format
    try {
      const urlObj = new URL(recipeUrl);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        throw new Error("Invalid URL protocol");
      }
    } catch (urlError) {
      console.log(`❌ [${requestId}] Invalid URL format: ${recipeUrl}`);
      return res.status(400).json({
        error: "Invalid URL format. Please provide a valid HTTP or HTTPS URL.",
      });
    }

    // Scrape the recipe from the URL
    const scrapedRecipe = await scrapeRecipeFromURL(recipeUrl);
    console.log(`✅ [${requestId}] URL scraping completed`);

    // Process the scraped recipe
    console.log(
      `🤖 [${requestId}] Starting AI processing of scraped content...`
    );
    const result = await processRecipeToFlowchart(scrapedRecipe.content);

    // Add the original URL and scraped title to the result
    result.originalUrl = scrapedRecipe.url;
    result.scrapedTitle = scrapedRecipe.title;

    console.log(
      `🎉 [${requestId}] Direct URL processing completed successfully`
    );
    console.log(
      `📤 [${requestId}] Sending response with ${
        result.ingredients?.length || 0
      } ingredients and ${result.actions?.length || 0} actions`
    );

    res.json(result);
  } catch (error) {
    console.error(
      `❌ [${requestId}] Error processing recipe URL:`,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// General chat endpoint for cooking questions
app.post("/api/chat", async (req, res) => {
  const requestId = Date.now().toString(36);
  console.log(`\n💬 [${requestId}] New chat request`);
  console.log(
    `💬 [${requestId}] Request body size: ${
      JSON.stringify(req.body).length
    } characters`
  );

  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      console.log(`❌ [${requestId}] Missing message`);
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`✅ [${requestId}] Starting chat processing...`);
    const result = await processCookingChat(message, conversationHistory || []);

    console.log(`🎉 [${requestId}] Chat processing completed successfully`);
    console.log(`📤 [${requestId}] Sending response`);

    res.json(result);
  } catch (error) {
    console.error(`❌ [${requestId}] Error processing chat:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/process-recipe", async (req, res) => {
  const requestId = Date.now().toString(36);
  console.log(`\n📥 [${requestId}] New recipe processing request`);
  console.log(
    `📥 [${requestId}] Request body size: ${
      JSON.stringify(req.body).length
    } characters`
  );

  try {
    const { recipeText } = req.body;

    if (!recipeText) {
      console.log(`❌ [${requestId}] Missing recipe text`);
      return res.status(400).json({ error: "Recipe text is required" });
    }

    // Check if the input is a URL
    let processedRecipeText = recipeText;
    let originalUrl = null;
    let scrapedTitle = null;

    try {
      const url = new URL(recipeText.trim());
      if (["http:", "https:"].includes(url.protocol)) {
        console.log(`🔗 [${requestId}] Detected URL input: ${recipeText}`);

        // Scrape the recipe from the URL
        const scrapedRecipe = await scrapeRecipeFromURL(recipeText);
        processedRecipeText = scrapedRecipe.content;
        originalUrl = scrapedRecipe.url;
        scrapedTitle = scrapedRecipe.title;

        console.log(`✅ [${requestId}] URL scraping completed`);
      }
    } catch (urlError) {
      // Not a URL, treat as recipe text
      console.log(`📝 [${requestId}] Treating input as recipe text`);
    }

    console.log(`✅ [${requestId}] Starting recipe processing...`);
    const result = await processRecipeToFlowchart(processedRecipeText);

    // Add URL metadata if this was scraped from a URL
    if (originalUrl) {
      result.originalUrl = originalUrl;
      result.scrapedTitle = scrapedTitle;
    }

    console.log(`🎉 [${requestId}] Recipe processing completed successfully`);
    console.log(
      `📤 [${requestId}] Sending response with ${
        result.ingredients?.length || 0
      } ingredients and ${result.actions?.length || 0} actions`
    );

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
    console.log(
      `🤖 [${requestId}] Starting AI processing of scraped content...`
    );
    const result = await processRecipeToFlowchart(scrapedRecipe.content);

    // Add the original URL and scraped title to the result
    result.originalUrl = scrapedRecipe.url;
    result.scrapedTitle = scrapedRecipe.title;

    console.log(
      `🎉 [${requestId}] Recipe URL processing completed successfully`
    );
    console.log(
      `📤 [${requestId}] Sending response with ${
        result.ingredients?.length || 0
      } ingredients and ${result.actions?.length || 0} actions`
    );

    res.json(result);
  } catch (error) {
    console.error(
      `❌ [${requestId}] Error processing recipe URL:`,
      error.message
    );
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

      console.log(
        `📁 [${requestId}] File uploaded: ${req.file.originalname} (${req.file.size} bytes)`
      );
      const filePath = req.file.path;
      const recipeText = fs.readFileSync(filePath, "utf8");

      // Clean up uploaded file
      fs.unlinkSync(filePath);
      console.log(`🗑️ [${requestId}] Temporary file cleaned up`);

      console.log(`✅ [${requestId}] Starting recipe processing...`);
      const result = await processRecipeToFlowchart(recipeText);

      console.log(
        `🎉 [${requestId}] File upload processing completed successfully`
      );
      console.log(
        `📤 [${requestId}] Sending response with ${
          result.ingredients?.length || 0
        } ingredients and ${result.actions?.length || 0} actions`
      );

      res.json(result);
    } catch (error) {
      console.error(
        `❌ [${requestId}] Error processing uploaded recipe:`,
        error.message
      );
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

// Recipe storage endpoints
app.post("/api/save-recipe", (req, res) => {
  const requestId = Date.now().toString(36);
  console.log(
    `\n💾 [${requestId}] Save recipe request from device: ${req.deviceId?.substring(
      0,
      8
    )}...`
  );

  try {
    const { recipeData } = req.body;

    if (!recipeData) {
      console.log(`❌ [${requestId}] Missing recipe data`);
      return res.status(400).json({ error: "Recipe data is required" });
    }

    // Use the AI-generated recipe name from the data, or fallback to a default
    const recipeName =
      recipeData.recipeName || recipeData.scrapedTitle || "Untitled Recipe";

    // Add metadata to the recipe
    const savedRecipe = {
      id: uuidv4(),
      name: recipeName,
      data: recipeData,
      deviceId: req.deviceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log(
      `✅ [${requestId}] Recipe saved: "${recipeName}" (ID: ${savedRecipe.id})`
    );
    res.json({
      success: true,
      recipeId: savedRecipe.id,
      message: "Recipe saved successfully",
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Error saving recipe:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/saved-recipes", (req, res) => {
  const requestId = Date.now().toString(36);
  console.log(
    `\n📚 [${requestId}] Get saved recipes request from device: ${req.deviceId?.substring(
      0,
      8
    )}...`
  );

  try {
    // In a real implementation, you'd query a database
    // For now, we'll return a message indicating the client should use localStorage
    console.log(`✅ [${requestId}] Returning localStorage instructions`);
    res.json({
      message: "Use localStorage to manage saved recipes",
      deviceId: req.deviceId,
      instructions:
        "Recipes are stored in browser localStorage with device-specific keys",
    });
  } catch (error) {
    console.error(
      `❌ [${requestId}] Error getting saved recipes:`,
      error.message
    );
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/delete-recipe/:recipeId", (req, res) => {
  const requestId = Date.now().toString(36);
  const { recipeId } = req.params;

  console.log(
    `\n🗑️ [${requestId}] Delete recipe request: ${recipeId} from device: ${req.deviceId?.substring(
      0,
      8
    )}...`
  );

  try {
    // In a real implementation, you'd delete from database
    // For now, we'll return success and let the client handle localStorage deletion
    console.log(
      `✅ [${requestId}] Recipe deletion handled by client localStorage`
    );
    res.json({
      success: true,
      message: "Recipe deleted successfully",
      recipeId: recipeId,
    });
  } catch (error) {
    console.error(`❌ [${requestId}] Error deleting recipe:`, error.message);
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
    version: "1.0.0",
  };
  console.log("💚 Health check requested");
  res.json(healthData);
});

// Catch-all route for recipe URLs - serve the main page for any path that looks like a URL
app.get("/*", (req, res) => {
  const urlPath = req.params[0];

  // Check if the path looks like a URL (starts with http:// or https://)
  if (
    urlPath &&
    (urlPath.startsWith("http://") || urlPath.startsWith("https://"))
  ) {
    console.log(`🔗 Recipe URL detected in path: ${urlPath}`);
    // Serve the main page - the frontend will handle the URL processing
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    } else {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    }
  } else {
    // For any other path, serve the main page
    if (process.env.NODE_ENV === 'production') {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    } else {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    }
  }
});

app.listen(port, () => {
  console.log("\n🚀 ================================================");
  console.log("🌿 Cardamom - Recipe Vault Started Successfully!");
  console.log("🚀 ================================================");
  console.log(`🌐 Server running on port ${port}`);
  console.log(`🔗 Web interface: http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log("📝 Features enabled:");
  console.log("   ✅ Recipe text processing");
  console.log("   ✅ File upload processing");
  console.log("   ✅ URL scraping and processing");
  console.log("   ✅ General cooking chat");
  console.log("   ✅ AI image generation (Nano Banana)");
  console.log("   ✅ Ingredient quantity extraction");
  console.log("   ✅ Device-based recipe storage");
  console.log("   ✅ localStorage recipe management");
  console.log("   ✅ Recipe browsing and history");
  console.log("   ✅ Comprehensive logging");
  console.log("🚀 ================================================\n");
});
