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
          nodeSpacing: 50,
          rankSpacing: 50,
          curve: 'basis',
        },
        themeVariables: {
          fontSize: '14px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          primaryColor: '#ffffff',
          primaryTextColor: '#000000',
          primaryBorderColor: '#000000',
          lineColor: '#000000',
          secondaryColor: '#f8f9fa',
          tertiaryColor: '#e9ecef',
        },
        securityLevel: 'loose',
      });
      console.log('✅ Mermaid initialized successfully');
      return true;
    } else {
      console.warn('⚠️ Mermaid not available');
      return false;
    }
  }, []);

  const validateMermaidSyntax = useCallback((mermaidCode) => {
    const issues = [];
    const code = mermaidCode.trim();
    
    // Check for required elements
    if (!code.startsWith('graph TD')) {
      issues.push("Diagram must start with 'graph TD'");
    }
    
    if (!code.includes('classDef')) {
      issues.push("Missing classDef statements for styling");
    }
    
    if (!code.includes('class ')) {
      issues.push("Missing class statements to apply styles");
    }
    
    // Check for common syntax issues
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.endsWith(';') && 
          !trimmedLine.includes('-->') && 
          !trimmedLine.includes('classDef') && 
          !trimmedLine.includes('class ') &&
          !trimmedLine.includes('graph TD')) {
        issues.push(`Line ${index + 1} may be missing semicolon: "${trimmedLine}"`);
      }
    });
    
    // Check for node ID issues - extract actual node IDs (before brackets/parentheses)
    const nodeIdPattern = /^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)\s*[\[\(]/gm;
    const nodeIds = [];
    let match;
    while ((match = nodeIdPattern.exec(code)) !== null) {
      nodeIds.push(match[2]);
    }
    
    const invalidNodeIds = nodeIds.filter(id => 
      id.includes('-') || id.includes(' ') || /[A-Z]/.test(id)
    );
    
    if (invalidNodeIds.length > 0) {
      issues.push(`Invalid node IDs found: ${invalidNodeIds.join(', ')}. Use only lowercase letters and underscores.`);
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues
    };
  }, []);

  const renderDiagram = useCallback(async (mermaidCode, containerId) => {
    if (!window.mermaid || !mermaidCode) {
      console.error('❌ Mermaid not available or no code provided');
      return false;
    }

    // Validate syntax before rendering
    const validation = validateMermaidSyntax(mermaidCode);
    if (!validation.isValid) {
      console.warn('⚠️ Mermaid syntax issues detected:', validation.issues);
      // Continue with rendering attempt - sometimes Mermaid is more forgiving
    }

    try {
      const { svg } = await window.mermaid.render(containerId, mermaidCode);
      
      // Post-process the SVG for better responsive behavior
      const processedSvg = postProcessSvg(svg);
      return processedSvg;
    } catch (error) {
      console.error('❌ Mermaid rendering error:', error);
      
      // Provide more detailed error information
      const errorInfo = {
        message: error.message,
        code: mermaidCode,
        validation: validation,
        suggestions: []
      };
      
      // Add suggestions based on error type
      if (error.message.includes('Parse error') || error.message.includes('syntax error')) {
        errorInfo.suggestions.push('Check for missing semicolons or malformed brackets');
        errorInfo.suggestions.push('Ensure all node IDs are properly defined');
        errorInfo.suggestions.push('Verify classDef and class statements are at the end');
      }
      
      if (error.message.includes('node') && error.message.includes('not found')) {
        errorInfo.suggestions.push('Check that all node IDs in connections are defined');
        errorInfo.suggestions.push('Look for typos in node references');
      }
      
      console.error('🔍 Detailed error info:', errorInfo);
      throw error;
    }
  }, [validateMermaidSyntax]);

  // Post-process SVG for better responsive behavior
  const postProcessSvg = useCallback((svgString) => {
    // Create a temporary DOM element to parse the SVG
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = svgString;
    const svg = tempDiv.querySelector('svg');
    
    if (!svg) return svgString;
    
    // Set responsive attributes
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', 'auto');
    svg.setAttribute('viewBox', svg.getAttribute('viewBox') || '0 0 800 600');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    
    // Add responsive styling
    svg.style.maxWidth = '100%';
    svg.style.height = 'auto';
    svg.style.overflow = 'visible';
    
    // Ensure text is readable on smaller screens
    const textElements = svg.querySelectorAll('text');
    textElements.forEach(text => {
      const fontSize = parseFloat(text.getAttribute('font-size') || '12');
      if (fontSize < 10) {
        text.setAttribute('font-size', '10');
      }
    });
    
    return tempDiv.innerHTML;
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
    validateMermaidSyntax,
    postProcessSvg,
    isAvailable: typeof window !== 'undefined' && !!window.mermaid,
  };
};
