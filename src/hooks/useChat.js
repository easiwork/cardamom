import { useState, useCallback } from 'react';
import { apiService } from '../services/api';

// Custom hook for managing chat functionality
export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const addMessage = useCallback((content, type = 'user', timestamp = new Date()) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      role: type === 'user' ? 'user' : 'assistant',
      content,
      timestamp,
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation history
    setConversationHistory(prev => {
      const updated = [...prev, newMessage];
      // Keep only the last 20 messages
      return updated.length > 20 ? updated.slice(-20) : updated;
    });

    return newMessage;
  }, []);

  const detectInputType = useCallback((input) => {
    const trimmedInput = input.trim();

    // Check if it's a URL
    if (isValidUrl(trimmedInput)) {
      return 'url';
    }

    // Check if it looks like a recipe
    const recipeKeywords = [
      'ingredients', 'instructions', 'directions', 'recipe', 'cook', 'bake', 'fry', 'boil',
      'tablespoon', 'teaspoon', 'cup', 'pound', 'ounce', 'gram', 'kilogram', 'liter',
      'preheat', 'mix', 'combine', 'add', 'stir', 'whisk', 'beat', 'fold', 'knead',
      'season', 'salt', 'pepper', 'sugar', 'flour', 'butter', 'oil', 'eggs', 'milk',
    ];

    const lowerInput = trimmedInput.toLowerCase();
    const keywordCount = recipeKeywords.filter(keyword => lowerInput.includes(keyword)).length;

    const hasIngredients = lowerInput.includes('ingredients') || 
      (lowerInput.includes('ingredient') && keywordCount >= 2);
    const hasInstructions = lowerInput.includes('instructions') || 
      lowerInput.includes('directions') || 
      (lowerInput.includes('step') && keywordCount >= 2);

    if (hasIngredients && hasInstructions && trimmedInput.length > 100) {
      return 'recipe';
    }

    if (keywordCount >= 4 && trimmedInput.length > 150) {
      return 'recipe';
    }

    if (trimmedInput.length < 100 && !hasIngredients && !hasInstructions) {
      return 'chat';
    }

    return 'chat';
  }, []);

  const isValidUrl = useCallback((string) => {
    try {
      const url = new URL(string);
      return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
      return false;
    }
  }, []);

  const sendMessage = useCallback(async (message, onRecipeProcessed) => {
    if (!message.trim() || isProcessing) return;

    setIsProcessing(true);
    addMessage(message, 'user');

    try {
      const inputType = detectInputType(message);
      let response;

      if (inputType === 'url') {
        response = await apiService.processUrl(message);
      } else if (inputType === 'recipe') {
        response = await apiService.processRecipe(message);
      } else {
        response = await apiService.sendChatMessage(message, conversationHistory.slice(0, -1));
      }

      if (inputType === 'recipe' || inputType === 'url') {
        // Handle recipe processing
        console.log('🍳 Recipe/URL processing detected, calling onRecipeProcessed callback');
        if (onRecipeProcessed) {
          console.log('✅ onRecipeProcessed callback exists, calling it');
          onRecipeProcessed(response);
        } else {
          console.log('❌ onRecipeProcessed callback is null/undefined');
        }
        
        // Add success message
        const recipeName = response.recipeName || response.scrapedTitle || 'Recipe';
        addMessage(
          `<h4>🍳 ${recipeName}</h4>
          <p>I've created a beautiful flowchart for your recipe! The recipe has been automatically saved to your collection.</p>`,
          'assistant'
        );
      } else {
        // Handle general chat
        addMessage(
          response.response || response.message || "I'm here to help with your cooking questions!",
          'assistant'
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = `Sorry, I encountered an error: ${error.message}`;
      
      if (error.message.includes('403 Forbidden') || error.message.includes('Access denied')) {
        errorMessage += `
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin-top: 12px;">
          <h4 style="color: #856404; margin: 0 0 8px 0;">💡 Alternative Solution</h4>
          <p style="color: #856404; margin: 0; font-size: 0.9em;">
            This website blocks automated requests. You can still create a flowchart by copying and pasting the recipe text directly into the chat!
          </p>
        </div>`;
      } else if (error.message.includes('429') || error.message.includes('rate limiting')) {
        errorMessage += `
        
        <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 8px; padding: 16px; margin-top: 12px;">
          <h4 style="color: #0c5460; margin: 0 0 8px 0;">⏳ Please Wait</h4>
          <p style="color: #0c5460; margin: 0; font-size: 0.9em;">
            The website is temporarily limiting requests. Please wait a moment and try again, or copy-paste the recipe text instead.
          </p>
        </div>`;
      }
      
      addMessage(errorMessage, 'assistant');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, addMessage, detectInputType, conversationHistory]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConversationHistory([]);
  }, []);

  return {
    messages,
    isProcessing,
    conversationHistory,
    addMessage,
    sendMessage,
    clearMessages,
  };
};
