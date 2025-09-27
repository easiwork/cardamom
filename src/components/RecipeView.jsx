import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useMermaid } from '../hooks/useMermaid';

const RecipeViewContainer = styled.div`
  flex: 1;
  display: ${props => props.active ? 'flex' : 'none'};
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  min-height: calc(100vh - 28px);
  perspective: 1000px;
`;

const RecipeContentContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 600px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const RecipeCardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 16px;
  }
`;

const RecipeCardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background: #ffffff;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: row;
`;

const RecipeDetailsPanel = styled.div`
  flex: 0 0 33.333%;
  padding: 32px;
  overflow-y: auto;
  background: #ffffff;
  border-right: 1px solid #e5e5e7;
`;

const RecipePhoto = styled.div`
  width: 100%;
  height: 200px;
  background: #f5f5f7;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  font-size: 1.2em;
  border: 1px solid #e5e5e7;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }
`;

const RecipeTitle = styled.h2`
  font-size: 1.8em;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 12px;
  line-height: 1.3;
`;

const RecipeMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 0.9em;
  color: #86868b;
  margin-bottom: 24px;
`;

const IngredientsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 1.2em;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
`;

const IngredientList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const IngredientItem = styled.div`
  background: #f9f9f9;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95em;
  color: #1d1d1f;
  border-left: 4px solid #007aff;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f8ff;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
  }
`;

const FlowchartPanel = styled.div`
  flex: 0 0 66.667%;
  padding: 0;
  background: #ffffff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const FlowchartContainer = styled.div`
  background: #ffffff;
  border: none;
  border-radius: 0;
  padding: 0;
  overflow: auto;
  box-shadow: none;
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  svg {
    background: white;
    border-radius: 0;
    box-shadow: none;
    width: 100%;
    height: 100%;
    min-height: 100%;
  }
`;

const FlowchartContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const PlaceholderText = styled.div`
  font-size: 4em;
  color: #86868b;
`;

const RecipeView = ({ currentRecipe, onClearRecipe }) => {
  const [flipped, setFlipped] = useState(false);
  const [flowchartElement, setFlowchartElement] = useState(null);
  const { renderDiagram, isAvailable } = useMermaid();

  useEffect(() => {
    if (currentRecipe) {
      setFlipped(false);
      // Auto-flip after 1 second
      const timer = setTimeout(() => {
        setFlipped(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setFlipped(false);
    }
  }, [currentRecipe]);

  useEffect(() => {
    if (currentRecipe && currentRecipe.mermaidDiagram && flowchartElement && isAvailable) {
      renderFlowchart(currentRecipe.mermaidDiagram);
    }
  }, [currentRecipe, flowchartElement, isAvailable]);

  const renderFlowchart = async (mermaidCode) => {
    if (!isAvailable || !flowchartElement) return;

    try {
      // Clear existing content
      flowchartElement.innerHTML = '';
      
      const diagramId = 'mermaid-diagram-' + Date.now();
      const svg = await renderDiagram(mermaidCode, diagramId);
      
      flowchartElement.innerHTML = svg;
      
      // Ensure the SVG takes full width
      const svgElement = flowchartElement.querySelector('svg');
      if (svgElement) {
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.maxWidth = '100%';
      }
    } catch (error) {
      console.error('Mermaid rendering error:', error);
      flowchartElement.innerHTML = `
        <div style="color: #ff3b30; padding: 16px; background: #fff5f5; border: 1px solid #fecaca; border-radius: 8px;">
          <strong>Error rendering diagram:</strong><br>
          ${error.message}
        </div>
      `;
    }
  };

  if (!currentRecipe) {
    return (
      <RecipeViewContainer active={false}>
        <div style={{ textAlign: 'center', color: '#86868b' }}>
          <PlaceholderText>🍳</PlaceholderText>
          <h2 style={{ marginTop: '20px', fontSize: '1.5em' }}>Select a Recipe</h2>
          <p style={{ marginTop: '8px' }}>Choose a recipe from the sidebar to view its details and flowchart</p>
        </div>
      </RecipeViewContainer>
    );
  }

  return (
    <RecipeViewContainer active={true}>
      <RecipeContentContainer flipped={flipped}>
        {/* Front of card - shows recipe image */}
        <RecipeCardFront>
          {currentRecipe.imageUrl ? (
            <img src={currentRecipe.imageUrl} alt={currentRecipe.recipeName || currentRecipe.scrapedTitle || 'Recipe'} />
          ) : (
            <PlaceholderText>🍳</PlaceholderText>
          )}
        </RecipeCardFront>

        {/* Back of card - shows recipe details and flowchart */}
        <RecipeCardBack>
          <RecipeDetailsPanel>
            <div>
              <RecipePhoto>
                {currentRecipe.imageUrl ? (
                  <img src={currentRecipe.imageUrl} alt={currentRecipe.recipeName || currentRecipe.scrapedTitle || 'Recipe'} />
                ) : (
                  '🍳'
                )}
              </RecipePhoto>
              <RecipeTitle>
                {currentRecipe.recipeName || currentRecipe.scrapedTitle || 'Recipe'}
              </RecipeTitle>
              <RecipeMeta>
                <div>{currentRecipe.ingredients?.length || 0} ingredients</div>
                <div>{currentRecipe.actions?.length || 0} steps</div>
                <div>{new Date().toLocaleDateString()}</div>
                {currentRecipe.originalUrl && (
                  <div>
                    <a 
                      href={currentRecipe.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: '#007aff', textDecoration: 'none' }}
                    >
                      🌐 Original Recipe
                    </a>
                  </div>
                )}
              </RecipeMeta>
            </div>

            <IngredientsSection>
              <SectionTitle>Ingredients</SectionTitle>
              <IngredientList>
                {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 ? (
                  currentRecipe.ingredients.map((ingredient, index) => (
                    <IngredientItem key={index}>
                      <strong>{ingredient.quantity}</strong> {ingredient.name}
                    </IngredientItem>
                  ))
                ) : (
                  <p style={{ color: '#86868b' }}>No ingredients available</p>
                )}
              </IngredientList>
            </IngredientsSection>
          </RecipeDetailsPanel>

          <FlowchartPanel>
            <FlowchartContainer>
              <FlowchartContent ref={setFlowchartElement}>
                {!currentRecipe.mermaidDiagram && (
                  <p style={{ color: '#86868b' }}>No flowchart available</p>
                )}
              </FlowchartContent>
            </FlowchartContainer>
          </FlowchartPanel>
        </RecipeCardBack>
      </RecipeContentContainer>
    </RecipeViewContainer>
  );
};

export default RecipeView;
