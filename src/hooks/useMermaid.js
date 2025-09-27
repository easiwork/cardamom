import { useEffect, useCallback } from 'react';

// Custom hook for Mermaid initialization and management
export const useMermaid = () => {
  const initializeMermaid = useCallback(() => {
    if (typeof window !== 'undefined' && window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          width: '100%',
        },
        themeVariables: {
          fontSize: '14px',
        },
      });
      console.log('✅ Mermaid initialized successfully');
      return true;
    } else {
      console.warn('⚠️ Mermaid not available');
      return false;
    }
  }, []);

  const renderDiagram = useCallback(async (mermaidCode, containerId) => {
    if (!window.mermaid || !mermaidCode) {
      console.error('❌ Mermaid not available or no code provided');
      return false;
    }

    try {
      const { svg } = await window.mermaid.render(containerId, mermaidCode);
      return svg;
    } catch (error) {
      console.error('❌ Mermaid rendering error:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    // Initialize Mermaid when the component mounts
    const timer = setTimeout(() => {
      initializeMermaid();
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeMermaid]);

  return {
    initializeMermaid,
    renderDiagram,
    isAvailable: typeof window !== 'undefined' && !!window.mermaid,
  };
};
