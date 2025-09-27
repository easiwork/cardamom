import React from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 320px;
  background: #ffffff;
  border-right: 1px solid #e5e5e7;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 24px 20px 16px;
  border-bottom: 1px solid #e5e5e7;
  background: #ffffff;
`;

const Title = styled.h1`
  font-size: 1.4em;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 4px;
`;

const Subtitle = styled.p`
  font-size: 0.85em;
  color: #86868b;
  line-height: 1.4;
`;

const NewRecipeButton = styled.button`
  background: #007aff;
  border: none;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin: 16px 20px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: #0056b3;
    transform: translateY(-1px);
  }
`;

const RecipesSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
`;

const SectionTitle = styled.h3`
  font-size: 0.8em;
  color: #86868b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  font-weight: 600;
  padding: 0 4px;
`;

const RecipeCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e5e7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:hover {
    background: #f9f9f9;
    border-color: #007aff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &.active {
    background: #e3f2fd;
    border-color: #007aff;
    box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
  }
`;

const RecipeImage = styled.div`
  width: 100%;
  height: 120px;
  background: #f5f5f7;
  border-radius: 8px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  font-size: 0.8em;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const RecipeTitle = styled.div`
  font-size: 0.95em;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const RecipeMeta = styled.div`
  font-size: 0.75em;
  color: #86868b;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RecipeActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${RecipeCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: #86868b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 0.8em;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e5e7;
    color: #1d1d1f;
  }

  &.delete:hover {
    background: #ff3b30;
    color: white;
  }
`;

const EmptyState = styled.p`
  color: #86868b;
  font-size: 0.9em;
  text-align: center;
  padding: 20px;
`;

const Sidebar = ({ recipes, currentRecipeId, onNewRecipe, onLoadRecipe, onDeleteRecipe }) => {
  const handleDeleteRecipe = (e, recipeId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      onDeleteRecipe(recipeId);
    }
  };

  const downloadRecipe = (e, recipe) => {
    e.stopPropagation();
    if (recipe.data.mermaidDiagram) {
      const blob = new Blob([recipe.data.mermaidDiagram], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recipe.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mmd`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <SidebarContainer>
      <Header>
        <Title>🌿 Cardamom</Title>
        <Subtitle>Recipe Vault - Your culinary collection</Subtitle>
      </Header>

      <NewRecipeButton onClick={onNewRecipe}>
        <span>+</span> New Recipe
      </NewRecipeButton>

      <RecipesSection>
        <SectionTitle>Recent Recipes</SectionTitle>
        {recipes.length === 0 ? (
          <EmptyState>No recipes yet. Start by sharing a recipe!</EmptyState>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              className={recipe.id === currentRecipeId ? 'active' : ''}
              onClick={() => onLoadRecipe(recipe.id)}
            >
              <RecipeImage>
                {recipe.data.imageUrl ? (
                  <img src={recipe.data.imageUrl} alt={recipe.name} />
                ) : (
                  '🍳'
                )}
              </RecipeImage>
              <RecipeTitle>{recipe.name}</RecipeTitle>
              <RecipeMeta>
                <span>{new Date(recipe.timestamp).toLocaleDateString()}</span>
                {recipe.data.originalUrl && (
                  <span title={`Saved from ${new URL(recipe.data.originalUrl).hostname}`}>
                    🌐
                  </span>
                )}
                <RecipeActions>
                  <ActionButton
                    onClick={(e) => downloadRecipe(e, recipe)}
                    title="Download"
                  >
                    💾
                  </ActionButton>
                  <ActionButton
                    className="delete"
                    onClick={(e) => handleDeleteRecipe(e, recipe.id)}
                    title="Delete"
                  >
                    🗑️
                  </ActionButton>
                </RecipeActions>
              </RecipeMeta>
            </RecipeCard>
          ))
        )}
      </RecipesSection>
    </SidebarContainer>
  );
};

export default Sidebar;
