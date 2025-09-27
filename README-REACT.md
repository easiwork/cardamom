# Cardamom - React Frontend

This document describes the React frontend refactor of the Cardamom Recipe Vault application.

## Architecture

The application has been refactored from a vanilla HTML/CSS/JavaScript frontend to a modern React single-page application using:

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **Styled Components** - CSS-in-JS styling
- **Custom Hooks** - State management and API integration
- **Axios** - HTTP client for API communication

## Project Structure

```
src/
├── components/          # React components
│   ├── App.jsx         # Main application component
│   ├── Sidebar.jsx     # Recipe sidebar with cards
│   ├── RecipeView.jsx  # Recipe display with flowchart
│   ├── ChatDrawer.jsx  # Chat interface
│   ├── ChatToggleButton.jsx # Chat toggle button
│   └── MacTitleBar.jsx # macOS-style title bar
├── hooks/              # Custom React hooks
│   ├── useRecipes.js   # Recipe state management
│   ├── useChat.js      # Chat functionality
│   └── useMermaid.js   # Mermaid diagram rendering
├── services/           # API service layer
│   └── api.js          # HTTP client and API calls
├── styles/             # Global styles
│   └── global.css      # Base CSS styles
├── types/              # Type definitions
│   └── index.js        # Application types
└── main.jsx           # React entry point
```

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Running the Application

1. **Development Mode (React + Backend)**
   ```bash
   # Terminal 1: Start the backend server
   npm run dev
   
   # Terminal 2: Start the React development server
   npm run dev:react
   ```

2. **Production Mode**
   ```bash
   # Build the React app
   npm run build
   
   # Start the production server
   NODE_ENV=production npm start
   ```

### Development URLs

- **React App**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Production**: http://localhost:3000

## Key Features

### State Management

The application uses custom React hooks for state management:

- **useRecipes**: Manages recipe data, localStorage persistence, and CRUD operations
- **useChat**: Handles chat messages, API communication, and input processing
- **useMermaid**: Manages Mermaid diagram initialization and rendering

### Component Architecture

- **App.jsx**: Main application container with layout and state coordination
- **Sidebar.jsx**: Recipe list with search, filtering, and management
- **RecipeView.jsx**: Recipe display with flip animation and flowchart rendering
- **ChatDrawer.jsx**: Sliding chat interface with message history
- **ChatToggleButton.jsx**: Floating action button for chat access

### API Integration

The `api.js` service layer provides:

- Recipe processing (text and URL)
- Chat functionality
- Health checks
- Error handling with user-friendly messages

### Styling

Uses styled-components for:

- Component-scoped styling
- Responsive design
- Theme consistency
- Animation and transitions

## Migration from Vanilla JS

The React refactor maintains all original functionality:

✅ Recipe processing from text and URLs  
✅ Mermaid flowchart generation  
✅ Chat interface with AI assistant  
✅ Recipe storage and management  
✅ Responsive design  
✅ macOS-style UI  
✅ Image generation integration  

## Build Configuration

- **Vite**: Fast development server with HMR
- **Proxy**: API requests proxied to backend during development
- **Production**: Static files served from `dist/` directory
- **Environment**: Automatic detection of dev vs production mode

## Browser Support

- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile responsive design

## Performance

- **Code Splitting**: Automatic with Vite
- **Tree Shaking**: Unused code elimination
- **Hot Module Replacement**: Fast development iteration
- **Optimized Builds**: Minified and compressed for production
