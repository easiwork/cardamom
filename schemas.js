// OpenAI structured output schemas for recipe parsing

const recipeFlowchartSchema = {
  type: "object",
  properties: {
    recipeName: {
      type: "string",
      description: "A human-readable, descriptive name for the recipe (e.g., 'Classic Chocolate Chip Cookies', 'Spicy Thai Basil Chicken')"
    },
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
      description: `Complete Mermaid flowchart diagram code with proper styling. 

CRITICAL SYNTAX REQUIREMENTS:
1. Start with: graph TD;
2. Use simple node IDs without spaces, special characters, or hyphens (use underscores instead)
3. Node definitions format: nodeId["Node Label"] or nodeId(("Node Label"))
4. Connections format: nodeId1 --> nodeId2
5. Styling MUST be at the end using classDef and class statements
6. classDef format: classDef className fill:#color,stroke:#color,stroke-width:2px,color:#color
7. class application format: class nodeId1,nodeId2,nodeId3 className

MANDATORY STRUCTURE:
- graph TD;
- [All node definitions]
- [All connections]
- classDef ingredient fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
- classDef action fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
- classDef final fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000
- class [nodeIds] ingredient
- class [nodeIds] action
- class [nodeIds] final

VALIDATION CHECKLIST:
✓ All node IDs are simple (no spaces, hyphens, or special chars)
✓ All node references in connections exist
✓ classDef statements come after all node definitions
✓ class statements come after classDef statements
✓ No syntax errors or malformed brackets/parentheses`,
    },
  },
  required: ["recipeName", "ingredients", "actions", "mermaidDiagram"],
  additionalProperties: false,
};

module.exports = {
  recipeFlowchartSchema,
};
