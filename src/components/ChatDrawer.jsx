import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

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
  right: ${props => props.isOpen ? '0' : '-400px'};
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
    right: ${props => props.isOpen ? '0' : '-100vw'};
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
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
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
  background: ${props => props.isUser ? '#007aff' : '#34c759'};
  color: white;
`;

const MessageContent = styled.div`
  flex: 1;
  max-width: calc(100% - 48px);
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const MessageText = styled.div`
  background: #f2f2f7;
  padding: 16px 20px;
  border-radius: 18px;
  color: #1d1d1f;
  line-height: 1.5;
  word-wrap: break-word;
  border: 1px solid #e5e5e7;
  background: ${props => props.isUser ? '#007aff' : '#f2f2f7'};
  border-color: ${props => props.isUser ? '#007aff' : '#e5e5e7'};
  color: ${props => props.isUser ? 'white' : '#1d1d1f'};

  h4 {
    margin: 0 0 8px 0;
    font-size: 1em;
  }

  pre {
    white-space: pre-wrap;
    font-family: inherit;
    margin: 0;
  }
`;

const MessageTime = styled.div`
  font-size: 0.75em;
  color: #86868b;
  margin-top: 8px;
  padding: 0 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
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
  animation-delay: ${props => {
    switch (props.delay) {
      case 1: return '-0.32s';
      case 2: return '-0.16s';
      default: return '0s';
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
  padding: 16px 60px 16px 20px;
  color: #1d1d1f;
  font-size: 16px;
  line-height: 1.5;
  resize: none;
  min-height: 24px;
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

const ChatDrawer = ({ isOpen, onClose, messages, isProcessing, onSendMessage, onNewChat }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleExampleClick = (message) => {
    setInputValue(message);
    handleSend();
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
        <Title>Cooking Assistant</Title>
        <CloseButton onClick={onClose}>×</CloseButton>
      </Header>

      <MessagesContainer>
        {showWelcome && (
          <WelcomeMessage>
            <h3>🌿 Welcome to Cardamom</h3>
            <p>
              Your personal recipe vault and cooking companion! Save recipes, get cooking tips, 
              ingredient substitutions, and create beautiful flowcharts from your recipes. 
              Let's explore the culinary world together!
            </p>

            <ExamplesGrid>
              <ExampleCard onClick={() => handleExampleClick('https://www.allrecipes.com/recipe/21014/good-old-fashioned-pancakes/')}>
                <h4>🌐 Recipe URL</h4>
                <p>Share a recipe URL to create a flowchart</p>
              </ExampleCard>

              <ExampleCard onClick={() => handleExampleClick('Classic Chocolate Chip Cookies\n\nIngredients:\n- 2 1/4 cups all-purpose flour\n- 1 tsp baking soda\n- 1 tsp salt\n- 1 cup butter, softened\n- 3/4 cup granulated sugar\n- 3/4 cup brown sugar\n- 2 large eggs\n- 2 tsp vanilla extract\n- 2 cups chocolate chips\n\nInstructions:\n1. Preheat oven to 375°F\n2. Mix flour, baking soda, and salt\n3. Cream butter and sugars\n4. Beat in eggs and vanilla\n5. Gradually blend in flour mixture\n6. Stir in chocolate chips\n7. Drop rounded tablespoons onto ungreased cookie sheets\n8. Bake 9-11 minutes until golden brown')}>
                <h4>📝 Recipe Text</h4>
                <p>Paste a recipe to create a flowchart</p>
              </ExampleCard>

              <ExampleCard onClick={() => handleExampleClick('What are some good substitutes for eggs in baking?')}>
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

        {messages.map((message) => (
          <Message key={message.id} isUser={message.role === 'user'}>
            <Avatar isUser={message.role === 'user'}>
              {message.role === 'user' ? 'U' : 'AI'}
            </Avatar>
            <MessageContent isUser={message.role === 'user'}>
              <MessageText 
                isUser={message.role === 'user'}
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
              <MessageTime isUser={message.role === 'user'}>
                {message.timestamp.toLocaleTimeString()}
              </MessageTime>
            </MessageContent>
          </Message>
        ))}

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
          <SendButton onClick={handleSend} disabled={isProcessing || !inputValue.trim()}>
            {isProcessing ? '⏳' : '→'}
          </SendButton>
        </InputWrapper>
      </InputContainer>
    </Drawer>
  );
};

export default ChatDrawer;
