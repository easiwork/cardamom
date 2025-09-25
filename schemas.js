// OpenAI structured output schemas for recipe parsing

const recipeFlowchartSchema = {
  type: "object",
  properties: {
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          quantity: { type: "string", description: "The amount/quantity of the ingredient (e.g., '1 cup', '2 tablespoons', '500g')" },
          description: { type: "string" },
        },
        required: ["id", "name", "quantity", "description"],
        additionalProperties: false,
      },
    },
    actions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          duration: { type: "number", description: "Duration in minutes" },
          inputIngredients: {
            type: "array",
            items: { type: "string" },
            description:
              "Array of ingredient IDs that are inputs to this action",
          },
          outputIngredients: {
            type: "array",
            items: { type: "string" },
            description:
              "Array of ingredient IDs that are outputs from this action",
          },
        },
        required: [
          "id",
          "name",
          "description",
          "duration",
          "inputIngredients",
          "outputIngredients",
        ],
        additionalProperties: false,
      },
    },
    mermaidDiagram: {
      type: "string",
      description:
        "Complete Mermaid flowchart diagram code with proper styling. Use simple node IDs (no spaces), classDef for styling at the end, and class statements to apply styles. Format: graph TD; followed by node definitions, then classDef statements, then class applications.",
    },
  },
  required: ["ingredients", "actions", "mermaidDiagram"],
  additionalProperties: false,
};

module.exports = {
  recipeFlowchartSchema,
};
