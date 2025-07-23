import React from 'react';

const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return <div className="text-muted">No content available</div>;
  
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    let html = text
      // Headers (must come first) - with minimal spacing
      .replace(/^### (.*?)$/gm, '<h3 class="fw-bold text-primary mt-2 mb-1" style="font-size: 1.25rem;">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="fw-bold text-primary mt-2 mb-1" style="font-size: 1.35rem;">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 class="fw-bold text-primary mt-2 mb-1" style="font-size: 1.45rem;">$1</h1>')
      
      // Bold text (must come before italic)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="fw-bold text-dark">$1</strong>')
      
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="fst-italic">$1</em>')
      
      // Underline
      .replace(/__(.*?)__/g, '<u class="text-decoration-underline">$1</u>')
      
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="bg-light px-2 py-1 rounded text-dark font-monospace">$1</code>')
      
      // Code blocks (must come before other formatting)
      .replace(/```([\s\S]*?)```/g, '<div class="my-4"><pre class="bg-dark text-light p-3 rounded shadow-sm overflow-auto"><code class="font-monospace">$1</code></pre></div>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary text-decoration-none fw-semibold">$1 <i class="bi bi-box-arrow-up-right ms-1"></i></a>')
      
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="text-center my-4"><img src="$2" alt="$1" class="img-fluid rounded shadow-sm" style="max-height: 400px;" /></div>')
      
      // Bullet Lists - improved detection
      .replace(/^- (.*?)$/gm, '<li style="margin-bottom: 0.25rem; list-style-type: disc; margin-left: 1rem;">$1</li>')
      
      // Numbered Lists  
      .replace(/^\d+\. (.*?)$/gm, '<li style="margin-bottom: 0.25rem;">$1</li>')
      
      // Quotes
      .replace(/^> (.*?)$/gm, '<blockquote class="blockquote border-start border-primary border-4 ps-3 py-2 my-2 bg-light rounded-end">$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr class="my-3 border-2 border-primary opacity-25">')
      
      // Warning boxes
      .replace(/⚠️ \*\*(.*?)\*\*/g, '<div class="alert alert-warning border-0 shadow-sm my-2"><i class="bi bi-exclamation-triangle-fill me-2"></i><strong>Warning:</strong> $1</div>')
      
      // Info boxes  
      .replace(/💡 \*\*(.*?)\*\*/g, '<div class="alert alert-info border-0 shadow-sm my-2"><i class="bi bi-info-circle-fill me-2"></i><strong>Note:</strong> $1</div>')
      
      // Convert line breaks to <br> tags
      .replace(/\n/g, '<br>');

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li style="[^"]*">[^<]*<\/li>[\s\S]*?)+/g, (match) => {
      return `<ul style="margin: 0.5rem 0; padding-left: 1.5rem;">${match}</ul>`;
    });

    // If no special formatting found, wrap in paragraph
    if (!html.includes('<h1>') && !html.includes('<h2>') && !html.includes('<h3>') 
        && !html.includes('<ul>') && !html.includes('<ol>') && !html.includes('<div>')) {
      html = `<p style="margin-bottom: 0.5rem; line-height: 1.6;">${html}</p>`;
    }

    return html;
  };

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      style={{
        fontSize: '1.05rem',
        lineHeight: '1.6',
        color: '#374151'
      }}
    />
  );
};

export default MarkdownRenderer;