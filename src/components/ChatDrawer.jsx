import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import ReactMarkdown from "react-markdown";

const slideIn = keyframes`
  from {
    right: -400px;
  }
  to {
    right: 0;
  }
`;

const slideOut = keyframes`
  from {
    right: 0;
  }
  to {
    right: -400px;
  }
`;

const typing = keyframes`
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
`;

const Drawer = styled.div`
  position: fixed;
  right: ${(props) => (props.isOpen ? "0" : "-400px")};
  top: 0;
  width: 400px;
  height: 100vh;
  background: #ffffff;
  border-left: 1px solid #e5e5e7;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100vw;
    right: ${(props) => (props.isOpen ? "0" : "-100vw")};
  }
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e7;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 1.2em;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #86868b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f2f2f7;
    color: #1d1d1f;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Message = styled.div`
  display: flex;
  gap: 16px;
  max-width: 100%;
  flex-direction: ${(props) => (props.isUser ? "row-reverse" : "row")};
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9em;
  font-weight: 600;
  flex-shrink: 0;
  background: ${(props) => (props.isUser ? "#007aff" : "#34c759")};
  color: white;
`;

const MessageContent = styled.div`
  flex: 1;
  max-width: calc(100% - 48px);
  text-align: ${(props) => (props.isUser ? "right" : "left")};
`;

const MessageText = styled.div`
  background: #f2f2f7;
  padding: 16px 20px;
  border-radius: 18px;
  color: #1d1d1f;
  line-height: 1.5;
  word-wrap: break-word;
  border: 1px solid #e5e5e7;
  background: ${(props) => (props.isUser ? "#007aff" : "#f2f2f7")};
  border-color: ${(props) => (props.isUser ? "#007aff" : "#e5e5e7")};
  color: ${(props) => (props.isUser ? "white" : "#1d1d1f")};

  /* Markdown element styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0 0 12px 0;
    font-weight: 600;
    line-height: 1.3;
  }

  h1 {
    font-size: 1.3em;
  }
  h2 {
    font-size: 1.2em;
  }
  h3 {
    font-size: 1.1em;
  }
  h4 {
    font-size: 1em;
  }
  h5 {
    font-size: 0.95em;
  }
  h6 {
    font-size: 0.9em;
  }

  p {
    margin: 0 0 12px 0;
    line-height: 1.5;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul,
  ol {
    margin: 0 0 12px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
    line-height: 1.4;
  }

  strong,
  b {
    font-weight: 600;
  }

  em,
  i {
    font-style: italic;
  }

  code {
    background: rgba(0, 0, 0, 0.1);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.9em;
  }

  pre {
    background: rgba(0, 0, 0, 0.05);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 12px 0;
    white-space: pre-wrap;
    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
    font-size: 0.9em;
    line-height: 1.4;
  }

  pre code {
    background: none;
    padding: 0;
  }

  blockquote {
    border-left: 4px solid rgba(0, 0, 0, 0.2);
    padding-left: 16px;
    margin: 12px 0;
    font-style: italic;
  }

  hr {
    border: none;
    border-top: 1px solid rgba(0, 0, 0, 0.2);
    margin: 16px 0;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
  }

  th,
  td {
    border: 1px solid rgba(0, 0, 0, 0.2);
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: rgba(0, 0, 0, 0.05);
    font-weight: 600;
  }
`;

const MessageTime = styled.div`
  font-size: 0.75em;
  color: #86868b;
  margin-top: 8px;
  padding: 0 4px;
  text-align: ${(props) => (props.isUser ? "right" : "left")};
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #86868b;
  font-style: italic;
  padding: 16px 20px;
  background: #f2f2f7;
  border-radius: 18px;
  border: 1px solid #e5e5e7;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  background: #86868b;
  border-radius: 50%;
  animation: ${typing} 1.4s infinite ease-in-out;
  animation-delay: ${(props) => {
    switch (props.delay) {
      case 1:
        return "-0.32s";
      case 2:
        return "-0.16s";
      default:
        return "0s";
    }
  }};
`;

const InputContainer = styled.div`
  padding: 24px;
  border-top: 1px solid #e5e5e7;
  background: #ffffff;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
`;

const Input = styled.textarea`
  width: 100%;
  background: #f2f2f7;
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  padding: 14px 60px 14px 20px;
  color: #1d1d1f;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  min-height: 72px;
  max-height: 200px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
  }

  &::placeholder {
    color: #86868b;
  }
`;

const SendButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: #007aff;
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #e5e5e7;
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 60px 24px;
  color: #86868b;

  h3 {
    font-size: 1.5em;
    color: #1d1d1f;
    margin-bottom: 16px;
    font-weight: 600;
  }

  p {
    font-size: 1em;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto 32px;
  }
`;

const ExamplesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ExampleCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f9f9f9;
    border-color: #007aff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  h4 {
    color: #1d1d1f;
    font-size: 0.9em;
    font-weight: 600;
    margin-bottom: 8px;
  }

  p {
    color: #86868b;
    font-size: 0.85em;
    line-height: 1.4;
    margin: 0;
  }
`;

const SaveRecipeButton = styled.button`
  background: #34c759;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  font-size: 0.85em;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;

  &:hover {
    background: #30b04f;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background: #e5e5e7;
    color: #86868b;
    cursor: not-allowed;
    transform: none;
  }
`;

const MessageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

// Utility function to detect if a message contains a recipe
const detectRecipeInMessage = (content) => {
  const text = content.toLowerCase();

  // Check for recipe indicators
  const hasIngredients =
    text.includes("ingredients") || text.includes("ingredient");
  const hasInstructions =
    text.includes("instructions") ||
    text.includes("directions") ||
    text.includes("steps") ||
    text.includes("method");
  const hasRecipeKeywords = [
    "cook",
    "bake",
    "fry",
    "boil",
    "mix",
    "combine",
    "add",
    "stir",
    "whisk",
    "beat",
  ].some((keyword) => text.includes(keyword));
  const hasMeasurements = [
    "cup",
    "tablespoon",
    "teaspoon",
    "pound",
    "ounce",
    "gram",
    "ml",
    "tbsp",
    "tsp",
  ].some((unit) => text.includes(unit));

  // Recipe detection criteria
  const isRecipe =
    (hasIngredients && hasInstructions) ||
    (hasIngredients && hasRecipeKeywords && hasMeasurements) ||
    (hasInstructions && hasRecipeKeywords && hasMeasurements);

  return isRecipe;
};

// Utility function to extract recipe data from message content
const extractRecipeFromMessage = (content) => {
  try {
    // Try to parse structured recipe data if it's in a specific format
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let recipeName = "Chat Recipe";
    let ingredients = [];
    let actions = [];

    // Extract recipe name (usually the first line or after a #)
    const nameMatch = content.match(/^#\s*(.+)$/m) || content.match(/^(.+)$/m);
    if (nameMatch) {
      recipeName = nameMatch[1].trim();
    }

    // Extract ingredients
    const ingredientsSection = content.match(
      /ingredients?[:\s]*([\s\S]*?)(?=instructions?|directions?|steps?|method|$)/i
    );
    if (ingredientsSection) {
      const ingredientLines = ingredientsSection[1]
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line &&
            (line.startsWith("-") || line.startsWith("*") || line.match(/^\d/))
        );

      ingredients = ingredientLines.map((line) => {
        // Remove bullet points and numbers
        const cleanLine = line.replace(/^[-*\d.\s]+/, "").trim();
        // Try to extract quantity and name
        const match = cleanLine.match(/^(.+?)\s+(.+)$/);
        if (match) {
          return { quantity: match[1].trim(), name: match[2].trim() };
        }
        return { quantity: "", name: cleanLine };
      });
    }

    // Extract instructions/actions
    const instructionsSection = content.match(
      /(?:instructions?|directions?|steps?|method)[:\s]*([\s\S]*?)$/i
    );
    if (instructionsSection) {
      const instructionLines = instructionsSection[1]
        .split("\n")
        .map((line) => line.trim())
        .filter(
          (line) =>
            line &&
            (line.match(/^\d+\./) ||
              line.startsWith("-") ||
              line.startsWith("*"))
        );

      actions = instructionLines.map((line, index) => {
        // Remove numbering and bullet points
        const cleanLine = line.replace(/^[-*\d.\s]+/, "").trim();
        return { action: cleanLine, time: "5 min" }; // Default time
      });
    }

    // If we couldn't extract structured data, create a simple recipe
    if (ingredients.length === 0 && actions.length === 0) {
      // Fallback: treat the entire content as a recipe
      const allLines = lines.filter((line) => line.length > 10);
      if (allLines.length > 0) {
        recipeName = allLines[0];
        // Try to identify ingredients and instructions from the text
        const text = content.toLowerCase();
        if (text.includes("ingredients") || text.includes("ingredient")) {
          // This looks like a recipe, create a basic structure
          ingredients = [
            { quantity: "As needed", name: "See full recipe below" },
          ];
          actions = [
            {
              action: "Follow the detailed instructions in the chat message",
              time: "Varies",
            },
          ];
        }
      }
    }

    return {
      recipeName,
      ingredients,
      actions,
      mermaidDiagram: generateSimpleMermaidDiagram(actions),
      imageUrl: null,
    };
  } catch (error) {
    console.error("Error extracting recipe from message:", error);
    return null;
  }
};

// Generate a simple mermaid diagram from actions
const generateSimpleMermaidDiagram = (actions) => {
  if (!actions || actions.length === 0) {
    return "graph TD\n    A[Start] --> B[Follow Instructions]";
  }

  const nodes = actions
    .map((action, index) => {
      const nodeId = String.fromCharCode(65 + index); // A, B, C, etc.
      const actionText =
        action.action.length > 30
          ? action.action.substring(0, 30) + "..."
          : action.action;
      return `${nodeId}["${actionText}"]`;
    })
    .join("\n    ");

  const connections = actions
    .map((_, index) => {
      if (index === 0) return "";
      const fromNode = String.fromCharCode(65 + index - 1);
      const toNode = String.fromCharCode(65 + index);
      return `    ${fromNode} --> ${toNode}`;
    })
    .filter((conn) => conn)
    .join("\n");

  return `graph TD\n    ${nodes}\n${connections}`;
};

const ChatDrawer = ({
  isOpen,
  onClose,
  messages,
  isProcessing,
  onSendMessage,
  onNewChat,
  onSaveRecipe,
}) => {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim() || isProcessing) return;

    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const handleExampleClick = (message) => {
    setInputValue(message);
    handleSend();
  };

  const handleSaveRecipe = (messageContent) => {
    if (!onSaveRecipe) {
      console.error("onSaveRecipe callback not provided");
      return;
    }

    const recipeData = extractRecipeFromMessage(messageContent);
    if (recipeData) {
      console.log("🍳 Extracted recipe data:", recipeData);
      onSaveRecipe(recipeData);
    } else {
      console.error("Failed to extract recipe data from message");
    }
  };

  const loadExampleRecipe = () => {
    const exampleRecipe = `Mapo Tofu

Ingredients:
- 1 block (14 oz) soft tofu, cut into 1-inch cubes
- 1/2 lb ground pork
- 2 tbsp Sichuan peppercorns
- 3 tbsp doubanjiang (fermented bean paste)
- 2 tbsp soy sauce
- 1 tbsp Shaoxing wine
- 1 tsp sugar
- 2 cloves garlic, minced
- 1 inch ginger, minced
- 2 green onions, chopped
- 1/4 cup chicken stock
- 2 tbsp cornstarch mixed with 2 tbsp water
- 2 tbsp vegetable oil

Instructions:
1. Heat oil in a wok over medium-high heat
2. Add ground pork and cook until browned
3. Add garlic, ginger, and Sichuan peppercorns, stir-fry for 30 seconds
4. Add doubanjiang and stir-fry for 1 minute
5. Add chicken stock, soy sauce, Shaoxing wine, and sugar
6. Bring to a boil and add tofu cubes
7. Simmer for 5 minutes, gently stirring occasionally
8. Add cornstarch slurry and stir until sauce thickens
9. Garnish with green onions and serve over rice`;

    handleExampleClick(exampleRecipe);
  };

  const showWelcome = messages.length === 0 && !isProcessing;

  return (
    <Drawer isOpen={isOpen}>
      <Header>
        <Title>Su Chef</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>

      <MessagesContainer>
        {showWelcome && (
          <WelcomeMessage>
            <h3>🌿 Welcome to Cardamom</h3>
            <p>
              Your personal recipe vault and cooking companion! Save recipes,
              get cooking tips, ingredient substitutions, and create beautiful
              flowcharts from your recipes. Let's explore the culinary world
              together!
            </p>

            <ExamplesGrid>
              <ExampleCard
                onClick={() =>
                  handleExampleClick(
                    "https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/"
                  )
                }
              >
                <h4>🌐 Recipe URL</h4>
                <p>Share a recipe URL to create a flowchart</p>
              </ExampleCard>

              <ExampleCard
                onClick={() =>
                  handleExampleClick(
                    "Classic Chocolate Chip Cookies\n\nIngredients:\n- 2 1/4 cups all-purpose flour\n- 1 tsp baking soda\n- 1 tsp salt\n- 1 cup butter, softened\n- 3/4 cup granulated sugar\n- 3/4 cup brown sugar\n- 2 large eggs\n- 2 tsp vanilla extract\n- 2 cups chocolate chips\n\nInstructions:\n1. Preheat oven to 375°F\n2. Mix flour, baking soda, and salt\n3. Cream butter and sugars\n4. Beat in eggs and vanilla\n5. Gradually blend in flour mixture\n6. Stir in chocolate chips\n7. Drop rounded tablespoons onto ungreased cookie sheets\n8. Bake 9-11 minutes until golden brown"
                  )
                }
              >
                <h4>📝 Recipe Text</h4>
                <p>Paste a recipe to create a flowchart</p>
              </ExampleCard>

              <ExampleCard
                onClick={() =>
                  handleExampleClick(
                    "What are some good substitutes for eggs in baking?"
                  )
                }
              >
                <h4>💡 Cooking Tips</h4>
                <p>Ask me about cooking techniques and substitutions</p>
              </ExampleCard>

              <ExampleCard onClick={loadExampleRecipe}>
                <h4>🎯 Try Example</h4>
                <p>Load the Mapo Tofu example recipe</p>
              </ExampleCard>
            </ExamplesGrid>
          </WelcomeMessage>
        )}

        {messages.map((message) => {
          const isRecipe =
            message.role === "assistant" &&
            detectRecipeInMessage(message.content);

          return (
            <Message key={message.id} isUser={message.role === "user"}>
              <Avatar isUser={message.role === "user"}>
                {message.role === "user" ? "U" : "AI"}
              </Avatar>
              <MessageContent isUser={message.role === "user"}>
                <MessageText isUser={message.role === "user"}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </MessageText>
                {isRecipe && (
                  <MessageActions>
                    <SaveRecipeButton
                      onClick={() => handleSaveRecipe(message.content)}
                    >
                      💾 Save Recipe
                    </SaveRecipeButton>
                  </MessageActions>
                )}
                <MessageTime isUser={message.role === "user"}>
                  {message.timestamp.toLocaleTimeString()}
                </MessageTime>
              </MessageContent>
            </Message>
          );
        })}

        {isProcessing && (
          <Message>
            <Avatar>AI</Avatar>
            <MessageContent>
              <TypingIndicator>
                <span>AI is thinking</span>
                <TypingDots>
                  <TypingDot delay={1} />
                  <TypingDot delay={2} />
                  <TypingDot delay={3} />
                </TypingDots>
              </TypingIndicator>
            </MessageContent>
          </Message>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer>
        <InputWrapper>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cooking, share a recipe, or paste a recipe URL..."
            rows="1"
            disabled={isProcessing}
          />
          <SendButton
            onClick={handleSend}
            disabled={isProcessing || !inputValue.trim()}
          >
            {isProcessing ? "⏳" : "→"}
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </Drawer>
  );
};

export default ChatDrawer;
