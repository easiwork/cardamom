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
  
  @media (max-width: 768px) {
    padding: 20px 10px;
    min-height: calc(100vh - 28px);
  }
`;

const RecipeContentContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 600px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${props => props.flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
  overflow: visible;
  
  @media (max-width: 768px) {
    height: auto;
    min-height: calc(100vh - 100px);
    max-width: 100%;
  }
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
  
  @media (max-width: 768px) {
    position: relative;
    height: 200px;
    margin-bottom: 20px;
  }
`;

const RecipeCardBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: visible;
  background: #ffffff;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: row;
  
  @media (max-width: 768px) {
    position: relative;
    transform: none;
    flex-direction: column;
    overflow-y: auto;
    height: auto;
    min-height: calc(100vh - 100px);
  }
`;

const RecipeDetailsPanel = styled.div`
  flex: 0 0 33.333%;
  padding: 32px;
  overflow-y: auto;
  background: #ffffff;
  border-right: 1px solid #e5e5e7;
  
  @media (max-width: 768px) {
    flex: 0 0 auto;
    border-right: none;
    border-bottom: 1px solid #e5e5e7;
    padding: 20px;
    max-height: 50vh;
  }
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
  
  @media (max-width: 768px) {
    flex: 1;
    min-height: 50vh;
  }
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
  min-height: 0; /* Allow flex item to shrink */

  svg {
    background: white;
    border-radius: 0;
    box-shadow: none;
    width: 100%;
    height: auto;
    max-width: 100%;
    display: block;
  }
`;

const FlowchartContent = styled.div`
  width: 100%;
  min-height: 0; /* Allow flex item to shrink */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  flex: 1;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
`;

const PlaceholderText = styled.div`
  font-size: 4em;
  color: #86868b;
`;

const WelcomeContainer = styled.div`
  text-align: center;
  color: #86868b;
  max-width: 600px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
    max-width: 100%;
  }
`;

const WelcomeTitle = styled.h1`
  margin-top: 20px;
  font-size: 2.5em;
  color: #1d1d1f;
  font-weight: 700;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 2em;
  }
`;

const WelcomeSubtitle = styled.h2`
  font-size: 1.3em;
  color: #1d1d1f;
  font-weight: 500;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 1.1em;
  }
`;

const WelcomeDescription = styled.p`
  margin-bottom: 16px;
  font-size: 1.1em;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1em;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 32px;
  text-align: left;
  max-width: 400px;
  margin: 32px auto 0;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95em;
  
  @media (max-width: 768px) {
    font-size: 0.9em;
  }
`;

const GettingStartedBox = styled.div`
  margin-top: 40px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;
  border: 1px solid #e5e5e7;
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-top: 32px;
  }
`;

const GettingStartedText = styled.p`
  margin: 0;
  font-size: 0.95em;
  color: #1d1d1f;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.9em;
  }
`;

const EditButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 122, 255, 0.1);
  border: 1px solid rgba(0, 122, 255, 0.3);
  color: #007aff;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: rgba(0, 122, 255, 0.2);
    border-color: rgba(0, 122, 255, 0.5);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
    padding: 4px 6px;
    font-size: 11px;
  }
`;

const RegenerationIndicator = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(52, 199, 89, 0.1);
  border: 1px solid rgba(52, 199, 89, 0.3);
  color: #34c759;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 10;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @media (max-width: 768px) {
    top: 12px;
    left: 12px;
    padding: 4px 6px;
    font-size: 11px;
  }
`;

const InlineEditTextarea = styled.textarea`
  width: 100%;
  height: 100%;
  min-height: 300px;
  padding: 12px;
  border: 1px solid #e5e5e7;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  margin-bottom: 16px;
  background: #f9f9f9;
  flex: 1;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #007aff;
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
    background: white;
  }
`;


const InlineEditActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-bottom: 16px;
  flex-shrink: 0;
`;

const InlineEditButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &.cancel {
    background: #f5f5f7;
    color: #1d1d1f;
    
    &:hover {
      background: #e5e5e7;
    }
  }

  &.save {
    background: #007aff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;


const RecipeView = ({ currentRecipe, onClearRecipe, onUpdateRecipe }) => {
  const [flipped, setFlipped] = useState(false);
  const [flowchartElement, setFlowchartElement] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { renderDiagram, isAvailable } = useMermaid();

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (currentRecipe) {
      setFlipped(false);
      // Auto-flip after 1 second only on desktop
      if (!isMobile) {
      const timer = setTimeout(() => {
        setFlipped(true);
      }, 1000);
      return () => clearTimeout(timer);
      } else {
        // On mobile, show the back (details) immediately
        setFlipped(true);
      }
    } else {
      setFlipped(false);
    }
  }, [currentRecipe, isMobile]);

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
      
      // Ensure the SVG is properly sized and responsive
      const svgElement = flowchartElement.querySelector('svg');
      if (svgElement) {
        // Set responsive attributes
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', 'auto');
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        
        // Set responsive styling
        svgElement.style.width = '100%';
        svgElement.style.height = 'auto';
        svgElement.style.maxWidth = '100%';
        svgElement.style.display = 'block';
        svgElement.style.overflow = 'visible';
        
        // Ensure the SVG has a proper viewBox if it doesn't have one
        if (!svgElement.getAttribute('viewBox')) {
          const width = svgElement.getAttribute('width') || '800';
          const height = svgElement.getAttribute('height') || '600';
          svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
        
        // Add a wrapper div for better control
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `
          width: 100%;
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        `;
        
        // Move the SVG into the wrapper
        svgElement.parentNode.insertBefore(wrapper, svgElement);
        wrapper.appendChild(svgElement);
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

  // Convert recipe to markdown format with YAML frontmatter
  const recipeToMarkdown = (recipe) => {
    if (!recipe) return '';
    
    // Create YAML frontmatter
    const frontmatter = {
      title: recipe.recipeName || recipe.scrapedTitle || 'Recipe',
      created: new Date().toLocaleDateString(),
      ingredients_count: recipe.ingredients?.length || 0,
      steps_count: recipe.actions?.length || 0,
      ...(recipe.originalUrl && { source: recipe.originalUrl })
    };
    
    // Convert frontmatter to YAML string
    const yamlFrontmatter = Object.entries(frontmatter)
      .map(([key, value]) => `${key}: ${typeof value === 'string' ? `"${value}"` : value}`)
      .join('\n');
    
    let markdown = `---\n${yamlFrontmatter}\n---\n\n`;
    markdown += `# ${frontmatter.title}\n\n`;
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      markdown += `## Ingredients\n\n`;
      recipe.ingredients.forEach(ingredient => {
        markdown += `- **${ingredient.quantity}** ${ingredient.name}\n`;
      });
      markdown += '\n';
    }
    
    if (recipe.actions && recipe.actions.length > 0) {
      markdown += `## Instructions\n\n`;
      recipe.actions.forEach((action, index) => {
        // Debug: log the action structure
        console.log('Action structure:', action);
        
        // Handle different possible action structures
        const actionText = action.action || action.step || action.description || action;
        const timeText = action.time || action.duration;
        
        markdown += `${index + 1}. ${actionText}`;
        if (timeText) {
          markdown += ` (${timeText})`;
        }
        markdown += '\n';
      });
    }
    
    return markdown;
  };

  // Handle edit button click
  const handleEditClick = () => {
    if (currentRecipe) {
      setEditText(recipeToMarkdown(currentRecipe));
      setIsEditing(true);
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editText.trim() || !onUpdateRecipe) return;
    
    setIsRegenerating(true);
    try {
      await onUpdateRecipe(editText);
      setIsEditing(false);
      setEditText('');
    } catch (error) {
      console.error('Error updating recipe:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText('');
  };

  if (!currentRecipe) {
    return (
      <RecipeViewContainer active={true}>
        <WelcomeContainer>
          <PlaceholderText>🌿</PlaceholderText>
          <WelcomeTitle>Welcome to Cardamom</WelcomeTitle>
          <WelcomeSubtitle>Your Personal Recipe Vault</WelcomeSubtitle>
          <WelcomeDescription>
            Transform any recipe into a beautiful visual flowchart and save it to your collection.
          </WelcomeDescription>
          <FeatureList>
            <FeatureItem>
              <span style={{ fontSize: '1.5em' }}>📝</span>
              <span>Share recipe URLs or paste recipe text</span>
            </FeatureItem>
            <FeatureItem>
              <span style={{ fontSize: '1.5em' }}>🎨</span>
              <span>Generate beautiful cooking flowcharts</span>
            </FeatureItem>
            <FeatureItem>
              <span style={{ fontSize: '1.5em' }}>💾</span>
              <span>Save and organize your recipe collection</span>
            </FeatureItem>
            <FeatureItem>
              <span style={{ fontSize: '1.5em' }}>💬</span>
              <span>Get cooking tips and ingredient substitutions</span>
            </FeatureItem>
          </FeatureList>
          <GettingStartedBox>
            <GettingStartedText>
              💡 <strong>Getting Started:</strong> Click the hamburger menu (☰) to browse recipes, or tap the Assistant button to share a new recipe!
            </GettingStartedText>
          </GettingStartedBox>
        </WelcomeContainer>
      </RecipeViewContainer>
    );
  }

  // Mobile layout - show details and flowchart stacked vertically
  if (isMobile) {
    return (
      <>
        <RecipeViewContainer active={true}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%',
            width: '100%',
            maxWidth: '100%'
          }}>
          {/* Recipe image at top */}
          <div style={{
            width: '100%',
            height: '200px',
            background: '#f5f5f7',
            borderRadius: '12px',
            marginBottom: '20px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#86868b',
            fontSize: '1.2em',
            border: '1px solid #e5e5e7'
          }}>
            {currentRecipe.imageUrl ? (
              <img 
                src={currentRecipe.imageUrl} 
                alt={currentRecipe.recipeName || currentRecipe.scrapedTitle || 'Recipe'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
              />
            ) : (
              <span style={{ fontSize: '2em' }}>🍳</span>
            )}
          </div>

          {/* Recipe details */}
          <div style={{
            flex: '0 0 auto',
            padding: '16px',
            background: '#ffffff',
            borderBottom: '1px solid #e5e5e7',
            maxHeight: '40vh',
            overflowY: 'auto',
            position: 'relative'
          }}>
            {isRegenerating && (
              <RegenerationIndicator>
                🔄 Regenerating...
              </RegenerationIndicator>
            )}
            {!isEditing ? (
              <>
                <EditButton onClick={handleEditClick} disabled={isRegenerating}>
                  ✏️ Edit
                </EditButton>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              {/* Recipe photo */}
              <div style={{
                width: '80px',
                height: '80px',
                background: '#f5f5f7',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#86868b',
                fontSize: '1.2em',
                border: '1px solid #e5e5e7',
                flexShrink: 0
              }}>
                {currentRecipe.imageUrl ? (
                  <img 
                    src={currentRecipe.imageUrl} 
                    alt={currentRecipe.recipeName || currentRecipe.scrapedTitle || 'Recipe'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '1.5em' }}>🍳</span>
                )}
              </div>
              
              {/* Recipe info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  fontSize: '1.3em',
                  fontWeight: '700',
                  color: '#1d1d1f',
                  marginBottom: '8px',
                  lineHeight: '1.3'
                }}>
                  {currentRecipe.recipeName || currentRecipe.scrapedTitle || 'Recipe'}
                </h2>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  fontSize: '0.8em',
                  color: '#86868b'
                }}>
                  <div>{currentRecipe.ingredients?.length || 0} ingredients</div>
                  <div>{currentRecipe.actions?.length || 0} steps</div>
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
                </div>
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '1em',
                fontWeight: '600',
                color: '#1d1d1f',
                marginBottom: '12px'
              }}>
                Ingredients
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                {currentRecipe.ingredients && currentRecipe.ingredients.length > 0 ? (
                  currentRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} style={{
                      background: '#f9f9f9',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.85em',
                      color: '#1d1d1f',
                      borderLeft: '3px solid #007aff',
                      transition: 'all 0.2s ease'
                    }}>
                      <strong>{ingredient.quantity}</strong> {ingredient.name}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#86868b', fontSize: '0.85em' }}>No ingredients available</p>
                )}
              </div>
            </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 style={{ marginBottom: '16px', color: '#1d1d1f', fontSize: '1.1em' }}>Edit Recipe</h3>
                  
                  <InlineEditTextarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit your recipe in markdown format with YAML frontmatter..."
                    style={{ minHeight: '200px', flex: '1' }}
                  />
                  
                  <InlineEditActions>
                    <InlineEditButton className="cancel" onClick={handleCancelEdit}>
                      Cancel
                    </InlineEditButton>
                    <InlineEditButton 
                      className="save" 
                      onClick={handleSaveEdit}
                      disabled={isRegenerating || !editText.trim()}
                    >
                      {isRegenerating ? 'Regenerating...' : 'Save & Regenerate'}
                    </InlineEditButton>
                  </InlineEditActions>
                </div>
              </>
            )}
          </div>

          {/* Flowchart */}
          <div style={{
            flex: '1',
            minHeight: '50vh',
            background: '#ffffff',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              background: '#ffffff',
              border: 'none',
              borderRadius: '0',
              padding: '0',
              overflow: 'auto',
              boxShadow: 'none',
              flex: '1',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '1'
              }} ref={setFlowchartElement}>
                {!currentRecipe.mermaidDiagram && (
                  <p style={{ color: '#86868b' }}>No flowchart available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </RecipeViewContainer>
    </>
    );
  }

  // Desktop layout - card flip animation
  return (
    <>
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
          {isRegenerating && (
            <RegenerationIndicator>
              🔄 Regenerating...
            </RegenerationIndicator>
          )}
          <RecipeDetailsPanel>
            {!isEditing ? (
              <>
                <EditButton onClick={handleEditClick} disabled={isRegenerating}>
                  ✏️ Edit
                </EditButton>
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
              </>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <h3 style={{ marginBottom: '16px', color: '#1d1d1f' }}>Edit Recipe</h3>
                  
                  <InlineEditTextarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    placeholder="Edit your recipe in markdown format with YAML frontmatter..."
                  />
                  
                  <InlineEditActions>
                    <InlineEditButton className="cancel" onClick={handleCancelEdit}>
                      Cancel
                    </InlineEditButton>
                    <InlineEditButton 
                      className="save" 
                      onClick={handleSaveEdit}
                      disabled={isRegenerating || !editText.trim()}
                    >
                      {isRegenerating ? 'Regenerating...' : 'Save & Regenerate'}
                    </InlineEditButton>
                  </InlineEditActions>
                </div>
              </>
            )}
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
    </>
  );
};


export default RecipeView;
