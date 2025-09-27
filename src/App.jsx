import React, { useState } from 'react';
import styled from 'styled-components';
import { useRecipes } from './hooks/useRecipes';
import { useChat } from './hooks/useChat';
import Sidebar from './components/Sidebar';
import RecipeView from './components/RecipeView';
import ChatDrawer from './components/ChatDrawer';
import ChatToggleButton from './components/ChatToggleButton';
import MacTitleBar from './components/MacTitleBar';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f7;
  overflow: hidden;
`;

const MacWindow = styled.div`
  background: #f5f5f7;
  border-radius: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  height: calc(100vh - 28px);
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-right: ${props => props.chatDrawerOpen ? '400px' : '0'};
`;

function App() {
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const { 
    recipes, 
    currentRecipe, 
    currentRecipeId, 
    saveRecipe, 
    loadRecipe, 
    deleteRecipe, 
    clearCurrentRecipe 
  } = useRecipes();
  
  const { 
    messages, 
    isProcessing, 
    addMessage, 
    sendMessage, 
    clearMessages 
  } = useChat();

  const handleRecipeProcessed = (recipeData) => {
    const recipeId = saveRecipe(recipeData);
    if (recipeId) {
      loadRecipe(recipeId);
    }
  };

  const handleNewChat = () => {
    clearMessages();
    clearCurrentRecipe();
    setChatDrawerOpen(true);
  };

  const toggleChatDrawer = () => {
    setChatDrawerOpen(!chatDrawerOpen);
  };

  const handleSendMessage = (message) => {
    sendMessage(message, handleRecipeProcessed);
  };

  return (
    <AppContainer>
      <MacWindow>
        <MacTitleBar />
        <MainContent chatDrawerOpen={chatDrawerOpen}>
          <Sidebar
            recipes={recipes}
            currentRecipeId={currentRecipeId}
            onNewRecipe={handleNewChat}
            onLoadRecipe={loadRecipe}
            onDeleteRecipe={deleteRecipe}
          />
          <RecipeView
            currentRecipe={currentRecipe}
            onClearRecipe={clearCurrentRecipe}
          />
          <ChatToggleButton
            onClick={toggleChatDrawer}
            isOpen={chatDrawerOpen}
          />
          <ChatDrawer
            isOpen={chatDrawerOpen}
            onClose={toggleChatDrawer}
            messages={messages}
            isProcessing={isProcessing}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
          />
        </MainContent>
      </MacWindow>
    </AppContainer>
  );
}

export default App;
