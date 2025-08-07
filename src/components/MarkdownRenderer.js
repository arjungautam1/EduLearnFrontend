import React, { useMemo, useCallback, useState } from 'react';

// Modern CSS-in-JS styles
const styles = {
  container: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'var(--bs-body-color, #212529)',
    '--code-bg': '#f8f9fa',
    '--code-border': '#e9ecef',
    '--code-text': '#e83e8c',
    '--pre-bg': '#f8f9fa',
    '--pre-border': '#dee2e6',
    '--blockquote-border': '#0d6efd',
    '--link-color': '#0d6efd',
    '--link-hover': '#0a58ca'
  },
  
  // Typography
  h1: {
    fontSize: '2rem',
    fontWeight: '600',
    marginTop: '2rem',
    marginBottom: '1rem',
    lineHeight: '1.2',
    borderBottom: '2px solid var(--bs-border-color, #dee2e6)',
    paddingBottom: '0.5rem'
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginTop: '1.5rem',
    marginBottom: '0.75rem',
    lineHeight: '1.3'
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginTop: '1.25rem',
    marginBottom: '0.5rem',
    lineHeight: '1.4'
  },
  h4: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginTop: '1rem',
    marginBottom: '0.5rem',
    lineHeight: '1.4'
  },
  
  // Text elements
  paragraph: {
    marginBottom: '1rem',
    lineHeight: '1.6'
  },
  strong: {
    fontWeight: '600'
  },
  em: {
    fontStyle: 'italic'
  },
  
  // Code elements
  inlineCode: {
    backgroundColor: '#f1f5f9',
    color: '#e11d48',
    padding: '0.15rem 0.4rem',
    borderRadius: '0.375rem',
    fontSize: '0.875em',
    fontFamily: 'JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    border: '1px solid #e2e8f0',
    fontWeight: '500',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: 'all 0.15s ease'
  },
  
  // Lists
  list: {
    marginBottom: '1rem',
    paddingLeft: '2rem'
  },
  listItem: {
    marginBottom: '0.25rem'
  },
  
  // Links
  link: {
    color: 'var(--link-color)',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'all 0.2s ease'
  },
  
  // Images
  image: {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    marginBottom: '1rem'
  },
  
  // Blockquotes
  blockquote: {
    borderLeft: '4px solid var(--blockquote-border)',
    paddingLeft: '1rem',
    margin: '1rem 0',
    fontStyle: 'italic',
    color: 'var(--bs-secondary, #6c757d)',
    backgroundColor: 'var(--bs-light, #f8f9fa)',
    padding: '1rem',
    borderRadius: '0.375rem'
  },
  
  // Horizontal rule
  hr: {
    border: 'none',
    height: '1px',
    backgroundColor: 'var(--bs-border-color, #dee2e6)',
    margin: '2rem 0'
  },
  
  // Code blocks - Modern design
  codeBlock: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease'
  },
  codeHeader: {
    backgroundColor: '#374151',
    backgroundImage: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #4b5563',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  languageLabel: {
    color: '#e5e7eb',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: '600'
  },
  copyButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '0.375rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#93c5fd',
    fontWeight: '500',
    backdropFilter: 'blur(8px)'
  },
  copyButtonHover: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
    color: '#dbeafe',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(59, 130, 246, 0.2)'
  },
  copyButtonSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderColor: '#22c55e',
    color: '#bbf7d0',
    boxShadow: '0 4px 8px rgba(34, 197, 94, 0.2)'
  },
  pre: {
    margin: '0',
    padding: '1.25rem',
    overflow: 'auto',
    fontFamily: 'JetBrains Mono, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    whiteSpace: 'pre',
    wordBreak: 'normal',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    scrollbarWidth: 'thin',
    scrollbarColor: '#475569 #1e293b'
  },
  
  // Alert styles
  alertWarning: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffecb5',
    borderRadius: '0.375rem',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderLeftWidth: '4px',
    borderLeftColor: '#ffc107'
  },
  alertInfo: {
    backgroundColor: '#d1ecf1',
    border: '1px solid #bee5eb',
    borderRadius: '0.375rem',
    padding: '0.75rem 1rem',
    marginBottom: '1rem',
    borderLeftWidth: '4px',
    borderLeftColor: '#17a2b8'
  }
};

// Custom hook for copy functionality
const useCopyToClipboard = () => {
  const [copiedId, setCopiedId] = useState(null);

  const copyText = useCallback(async (text, id) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
        document.execCommand('copy');
    document.body.removeChild(textArea);
      }
      
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  }, []);

  return { copyText, copiedId };
};

// Modern markdown parser components
const MarkdownComponents = {
  CodeBlock: ({ code, language, id, copyText, copiedId }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isBlockHovered, setIsBlockHovered] = useState(false);
    const isCopied = copiedId === id;
    
    const handleCopy = () => {
      copyText(code, id);
    };

    const buttonStyle = {
      ...styles.copyButton,
      ...(isHovered ? styles.copyButtonHover : {}),
      ...(isCopied ? styles.copyButtonSuccess : {})
    };

    const blockStyle = {
      ...styles.codeBlock,
      ...(isBlockHovered && {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.1)',
        borderColor: '#475569'
      })
    };

    return (
      <div 
        style={blockStyle} 
        role="region" 
        aria-label={`Code block in ${language}`}
        onMouseEnter={() => setIsBlockHovered(true)}
        onMouseLeave={() => setIsBlockHovered(false)}
      >
        <div style={styles.codeHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              opacity: 0.8
            }}></div>
            <div style={{
              width: '12px', 
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              opacity: 0.8
            }}></div>
            <div style={{
              width: '12px',
              height: '12px', 
              borderRadius: '50%',
              backgroundColor: '#10b981',
              opacity: 0.8
            }}></div>
            <span style={{...styles.languageLabel, marginLeft: '0.5rem'}} aria-label={`Language: ${language}`}>
              {language.charAt(0).toUpperCase() + language.slice(1)}
            </span>
          </div>
          <button
            style={buttonStyle}
            onClick={handleCopy}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label={`Copy ${language} code to clipboard`}
            title={isCopied ? 'Copied!' : 'Copy code'}
          >
            {isCopied ? '✓ Copied' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
                Copy
              </span>
            )}
          </button>
        </div>
        <pre style={styles.pre}>
          <code>{code}</code>
        </pre>
      </div>
    );
  },

  InlineCode: ({ children }) => (
    <code style={styles.inlineCode}>{children}</code>
  ),

  Link: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        ...styles.link,
        ':hover': { borderBottomColor: 'var(--link-hover)' }
      }}
    >
      {children}
    </a>
  ),

  Image: ({ src, alt }) => (
    <div style={{ textAlign: 'center', margin: '1rem 0' }}>
      <img src={src} alt={alt} style={styles.image} loading="lazy" />
    </div>
  ),

  Alert: ({ type, children }) => (
    <div 
      style={type === 'warning' ? styles.alertWarning : styles.alertInfo}
      role="alert"
      aria-live="polite"
    >
      {children}
    </div>
  )
};

// Enhanced markdown parser with better structure
const parseMarkdown = (text, copyText, copiedId) => {
  if (!text) return [];

  const lines = text.split('\n');
  const elements = [];
  let currentElement = null;
  let codeBlockId = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

        // Code blocks
    if (trimmedLine.startsWith('```')) {
      if (currentElement?.type === 'codeblock') {
        // End code block
        const currentCodeId = `code-${codeBlockId++}`;
        
        elements.push({
          type: 'codeblock',
          component: (
            <MarkdownComponents.CodeBlock
              key={currentCodeId}
              code={currentElement.content.join('\n')}
              language={currentElement.language}
              id={currentCodeId}
              copyText={copyText}
              copiedId={copiedId}
            />
          )
        });
        currentElement = null;
    } else {
        // Start code block
        const language = trimmedLine.slice(3).trim() || 'text';
        
        currentElement = {
          type: 'codeblock',
          language,
          content: []
        };
      }
      continue;
    }

    if (currentElement?.type === 'codeblock') {
      currentElement.content.push(line);
      continue;
    }

    // Headers
    if (trimmedLine.startsWith('#')) {
      const level = trimmedLine.match(/^#+/)[0].length;
      const text = trimmedLine.slice(level).trim();
      const HeaderTag = `h${Math.min(level, 4)}`;
      const headerStyle = styles[HeaderTag] || styles.h4;
      
      elements.push({
        type: 'header',
        component: React.createElement(HeaderTag, {
          key: `header-${i}`,
          style: headerStyle
        }, parseInlineMarkdown(text))
      });
      continue;
    }

    // Horizontal rules
    if (trimmedLine === '---') {
      elements.push({
        type: 'hr',
        component: <hr key={`hr-${i}`} style={styles.hr} />
      });
      continue;
    }

    // Blockquotes
    if (trimmedLine.startsWith('>')) {
      const text = trimmedLine.slice(1).trim();
      elements.push({
        type: 'blockquote',
        component: (
          <blockquote key={`quote-${i}`} style={styles.blockquote}>
            {parseInlineMarkdown(text)}
          </blockquote>
        )
      });
      continue;
    }

    // Lists
    if (trimmedLine.match(/^[\-\*\+]\s/) || trimmedLine.match(/^\d+\.\s/)) {
      const isOrdered = trimmedLine.match(/^\d+\.\s/);
      const text = trimmedLine.replace(/^[\-\*\+\d]+\.?\s/, '');
      
      if (currentElement?.type !== 'list' || currentElement.ordered !== isOrdered) {
        if (currentElement?.type === 'list') {
          elements.push(currentElement);
        }
        currentElement = {
          type: 'list',
          ordered: isOrdered,
          items: []
        };
      }
      
      currentElement.items.push(parseInlineMarkdown(text));
      continue;
    }

    // Close current list if we're not in a list item
    if (currentElement?.type === 'list') {
      const ListTag = currentElement.ordered ? 'ol' : 'ul';
      elements.push({
        type: 'list',
        component: React.createElement(ListTag, {
          key: `list-${i}`,
          style: styles.list
        }, currentElement.items.map((item, idx) => 
          React.createElement('li', {
            key: `item-${idx}`,
            style: styles.listItem
          }, item)
        ))
      });
      currentElement = null;
    }

    // Alert boxes
    if (trimmedLine.startsWith('⚠️') || trimmedLine.startsWith('💡')) {
      const type = trimmedLine.startsWith('⚠️') ? 'warning' : 'info';
      const text = trimmedLine.slice(2).trim();
      elements.push({
        type: 'alert',
        component: (
          <MarkdownComponents.Alert key={`alert-${i}`} type={type}>
            {parseInlineMarkdown(text)}
          </MarkdownComponents.Alert>
        )
      });
      continue;
    }

    // Regular paragraphs
    if (trimmedLine) {
      elements.push({
        type: 'paragraph',
        component: (
          <p key={`p-${i}`} style={styles.paragraph}>
            {parseInlineMarkdown(trimmedLine)}
          </p>
        )
      });
    }
  }

  // Close any remaining elements
  if (currentElement?.type === 'list') {
    const ListTag = currentElement.ordered ? 'ol' : 'ul';
    elements.push({
      type: 'list',
      component: React.createElement(ListTag, {
        key: 'list-final',
        style: styles.list
      }, currentElement.items.map((item, idx) => 
        React.createElement('li', {
          key: `item-${idx}`,
          style: styles.listItem
        }, item)
      ))
    });
  }
  
  // Handle unclosed code blocks
  if (currentElement?.type === 'codeblock') {
    const currentCodeId = `code-${codeBlockId++}`;
    
    elements.push({
      type: 'codeblock',
      component: (
        <MarkdownComponents.CodeBlock
          key={currentCodeId}
          code={currentElement.content.join('\n')}
          language={currentElement.language}
          id={currentCodeId}
          copyText={copyText}
          copiedId={copiedId}
        />
      )
    });
  }

  return elements;
};

// Parse inline markdown elements
const parseInlineMarkdown = (text) => {
  if (!text) return '';

  // Split text into parts for processing
  const parts = [];
  let remaining = text;
  let key = 0;

  // Process inline code first (highest priority)
  remaining = remaining.replace(/`([^`]+)`/g, (match, code) => {
    const placeholder = `__INLINE_CODE_${key}__`;
    parts.push({
      placeholder,
      component: <MarkdownComponents.InlineCode key={key++}>{code}</MarkdownComponents.InlineCode>
    });
    return placeholder;
  });

  // Process links
  remaining = remaining.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
    const placeholder = `__LINK_${key}__`;
    parts.push({
      placeholder,
      component: <MarkdownComponents.Link key={key++} href={href}>{text}</MarkdownComponents.Link>
    });
    return placeholder;
  });

  // Process images
  remaining = remaining.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    const placeholder = `__IMAGE_${key}__`;
    parts.push({
      placeholder,
      component: <MarkdownComponents.Image key={key++} src={src} alt={alt} />
    });
    return placeholder;
  });

  // Process bold text
  remaining = remaining.replace(/\*\*(.*?)\*\*/g, (match, text) => {
    const placeholder = `__BOLD_${key}__`;
    parts.push({
      placeholder,
      component: <strong key={key++} style={styles.strong}>{text}</strong>
    });
    return placeholder;
  });

  // Process italic text
  remaining = remaining.replace(/\*(.*?)\*/g, (match, text) => {
    const placeholder = `__ITALIC_${key}__`;
    parts.push({
      placeholder,
      component: <em key={key++} style={styles.em}>{text}</em>
    });
    return placeholder;
  });

  // Split by placeholders and build final result
  let result = remaining;
  parts.forEach(part => {
    result = result.replace(part.placeholder, `__COMPONENT_${part.component.key}__`);
  });

  // Convert to React elements
  const finalParts = result.split(/(__COMPONENT_\d+__)/);
  return finalParts.map(part => {
    const componentMatch = part.match(/^__COMPONENT_(\d+)__$/);
    if (componentMatch) {
      const componentKey = componentMatch[1];
      return parts.find(p => p.component.key == componentKey)?.component;
    }
    return part;
  }).filter(part => part !== '');
};

const MarkdownRenderer = ({ content, className = '', theme = 'light' }) => {
  const { copyText, copiedId } = useCopyToClipboard();

  const parsedElements = useMemo(() => {
    if (!content) return [];
    return parseMarkdown(content, copyText, copiedId);
  }, [content, copyText, copiedId]);

  if (!content) {
    return (
      <div className={`text-muted ${className}`} role="status">
        No content available
      </div>
    );
  }

  return (
    <div 
      className={`markdown-renderer ${className}`}
      style={{
        ...styles.container,
        ...(theme === 'dark' && {
          '--code-bg': '#2d3748',
          '--code-border': '#4a5568', 
          '--code-text': '#f7fafc',
          '--pre-bg': '#1a202c',
          '--pre-border': '#2d3748',
          color: '#f7fafc',
          backgroundColor: '#1a202c'
        })
      }}
      role="main"
      aria-label="Markdown content"
    >
      {parsedElements.map((element, index) => 
        element.component || <div key={index}></div>
      )}
    </div>
  );
};

export default MarkdownRenderer;