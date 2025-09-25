# Recipe Flowchart Generator

A web service that transforms recipes into beautiful Mermaid flowcharts using OpenAI's structured outputs. The service analyzes recipe text and creates visual flowcharts showing the transformation of ingredients through cooking actions.

## Features

- 🍳 **Recipe Analysis**: Parses recipes into structured ingredients and actions
- 📊 **Mermaid Flowcharts**: Generates interactive flowcharts showing cooking flow
- 🤖 **AI-Powered**: Uses OpenAI GPT-4 with structured outputs for accurate parsing
- 🎨 **Beautiful UI**: Modern, responsive web interface
- 📁 **File Upload**: Support for text file uploads
- 🌐 **URL Processing**: Direct recipe processing from URLs via query parameters
- ⏱️ **Timing Information**: Shows duration and parallel actions
- 💾 **Recipe Storage**: Save and browse your processed recipes

## Setup

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment**

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

3. **Start the Service**

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

4. **Access the Web Interface**
   Open http://localhost:3000 in your browser

## Direct URL Processing

You can process recipes directly from URLs by appending the recipe URL to your domain:

```
http://localhost:3000/https://example.com/recipe
```

This will automatically:
1. Prefill the text box with the recipe URL
2. Scrape the recipe from the provided URL
3. Process it with AI to generate a flowchart
4. Display the results immediately

**Supported Recipe Websites:**
- AllRecipes
- Food Network
- BBC Good Food
- Most recipe websites with structured content

**Example Usage:**
```
http://localhost:3000/https://www.allrecipes.com/recipe/213742/cheesy-chicken-broccoli-casserole/
```

**Pro Tip:** When browsing a recipe website, simply add your domain in front of the URL:
- Original: `https://www.allrecipes.com/recipe/12345/chocolate-cake/`
- Cardamom: `http://localhost:3000/https://www.allrecipes.com/recipe/12345/chocolate-cake/`

## API Endpoints

### POST `/api/process-recipe`

Process a recipe from text input.

**Request Body:**

```json
{
  "recipeText": "Your recipe text here..."
}
```

**Response:**

```json
{
  "ingredients": [
    {
      "id": "ingredient_1",
      "name": "Oil",
      "description": "1/2 cup oil (divided)"
    }
  ],
  "actions": [
    {
      "id": "action_1",
      "name": "Toast Chilies",
      "description": "Heat oil and toast peppers until fragrant",
      "duration": 5,
      "inputIngredients": ["oil", "chilies"],
      "outputIngredients": ["toasted_chili_oil"]
    }
  ],
  "mermaidDiagram": "flowchart TD\n    ..."
}
```

### POST `/api/upload-recipe`

Process a recipe from uploaded file.

**Request:** Multipart form data with `recipeFile`

### GET `/api/process-url/*`

Process a recipe directly from a URL via path parameter.

**Path Parameter:**
- The recipe URL is provided as the path after `/api/process-url/`

**Example:**
```
GET /api/process-url/https://example.com/recipe
```

**Response:** Same as `/api/process-recipe` with additional fields:
- `originalUrl`: The original recipe URL
- `scrapedTitle`: The title extracted from the webpage

### GET `/api/health`

Health check endpoint.

## How It Works

1. **Recipe Parsing**: The service uses OpenAI GPT-4 with structured outputs to analyze recipe text
2. **Ingredient Extraction**: Identifies all ingredients with quantities and descriptions
3. **Action Analysis**: Breaks down cooking steps into discrete actions with timing
4. **Flowchart Generation**: Creates Mermaid diagrams showing the flow from ingredients to final dish
5. **Visualization**: Renders interactive flowcharts in the web interface

## Flowchart Rules

- **Ingredients**: Represented as rectangular nodes
- **Actions**: Represented as rounded rectangular nodes
- **Flow**: Actions transform input ingredients into output ingredients
- **Timing**: Actions include duration information
- **Parallel Actions**: Actions that can be performed simultaneously are positioned in the same row
- **No-op Actions**: Actions like "hold" or "warm up" that produce the same ingredient

## Example

Try the included Mapo Tofu recipe to see how it transforms into a flowchart showing:

- Initial ingredients (oil, chilies, pork, tofu, etc.)
- Cooking actions (toast chilies, fry pork, simmer sauce, etc.)
- Final dish (Mapo Tofu)

## Requirements

- Node.js 16+
- OpenAI API key
- Modern web browser with JavaScript enabled

## License

MIT
