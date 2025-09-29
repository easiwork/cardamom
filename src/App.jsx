import React, { useState, useEffect } from 'react';
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
  
  @media (max-width: 768px) {
    margin-right: 0;
    position: relative;
  }
`;

const SidebarToggleButton = styled.button`
  position: fixed;
  bottom: 20px;
  left: 20px;
  z-index: 1000;
  background: #007aff;
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
  transition: all 0.2s ease;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }

  &:hover {
    background: #0056b3;
    transform: scale(1.05);
  }
`;

const SidebarOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: ${props => props.show ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

function App() {
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { 
    recipes, 
    currentRecipe, 
    currentRecipeId, 
    deviceId,
    saveRecipe, 
    loadRecipe, 
    updateRecipe,
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
    console.log('🍳 handleRecipeProcessed called with:', recipeData);
    const recipeId = saveRecipe(recipeData);
    console.log('💾 Recipe saved with ID:', recipeId);
    if (recipeId) {
      loadRecipe(recipeId);
      console.log('📖 Recipe loaded:', recipeId);
    }
  };

  // Check for recipe URL in the path on app load
  useEffect(() => {
    // Only proceed if deviceId is available
    if (!deviceId) {
      console.log('⏳ Waiting for deviceId to be initialized...');
      return;
    }

    const checkForRecipeUrl = () => {
      const path = window.location.pathname;
      
      // Check if the path looks like a recipe URL (starts with http:// or https://)
      if (path && (path.startsWith('/http://') || path.startsWith('/https://'))) {
        const recipeUrl = path.substring(1); // Remove the leading slash
        
        console.log('🔗 Recipe URL detected in path:', recipeUrl);
        console.log('✅ DeviceId is available:', deviceId);
        
        // Open chat drawer and process the URL
        setChatDrawerOpen(true);
        
        // Add a message indicating we're processing the URL
        addMessage(`Processing recipe from URL: ${recipeUrl}`, 'user');
        
        // Process the URL
        sendMessage(recipeUrl, handleRecipeProcessed);
        
        // Clean up the URL from the browser history
        window.history.replaceState({}, document.title, '/');
      }
    };

    checkForRecipeUrl();
  }, [deviceId, addMessage, sendMessage, handleRecipeProcessed]);

  const handleNewChat = () => {
    clearMessages();
    clearCurrentRecipe();
    setChatDrawerOpen(true);
  };

  const toggleChatDrawer = () => {
    setChatDrawerOpen(!chatDrawerOpen);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSendMessage = (message) => {
    sendMessage(message, handleRecipeProcessed);
  };

  const handleUpdateRecipe = async (markdownText) => {
    // Process the markdown text as a new recipe through the API
    try {
      console.log('🔄 Updating recipe with ID:', currentRecipeId);
      
      const response = await fetch('/api/process-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeText: markdownText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process recipe');
      }

      const recipeData = await response.json();
      
      // Update the existing recipe instead of creating a new one
      if (currentRecipeId) {
        const success = updateRecipe(currentRecipeId, recipeData);
        if (success) {
          console.log('✅ Recipe updated successfully');
        } else {
          console.error('❌ Failed to update recipe');
          throw new Error('Failed to update recipe in storage');
        }
      } else {
        console.error('❌ No current recipe ID to update');
        throw new Error('No recipe selected for update');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  return (
    <AppContainer>
      <MacWindow>
        <MacTitleBar />
        <SidebarToggleButton onClick={toggleSidebar}>
          ☰
        </SidebarToggleButton>
        <SidebarOverlay show={sidebarOpen} onClick={closeSidebar} />
        <MainContent chatDrawerOpen={chatDrawerOpen}>
          <Sidebar
            recipes={recipes}
            currentRecipeId={currentRecipeId}
            onNewRecipe={handleNewChat}
            onLoadRecipe={loadRecipe}
            onDeleteRecipe={deleteRecipe}
            isOpen={sidebarOpen}
            onClose={closeSidebar}
          />
          <RecipeView
            currentRecipe={currentRecipe}
            onClearRecipe={clearCurrentRecipe}
            onUpdateRecipe={handleUpdateRecipe}
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
