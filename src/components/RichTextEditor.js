import React, { useState, useRef, useCallback } from 'react';
import { Button, Form, Card, Tabs, Tab } from 'react-bootstrap';

const RichTextEditor = ({ value, onChange, placeholder = "Enter lesson content...", minHeight = 500 }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const textareaRef = useRef(null);

  const insertText = useCallback((before, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = before + (selectedText || placeholder) + after;
    
    const newValue = value.substring(0, start) + textToInsert + value.substring(end);
    onChange(newValue);

    // Set cursor position after insertion
    setTimeout(() => {
      const newCursorPos = start + before.length + (selectedText || placeholder).length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [value, onChange]);

  const formatButtons = [
    {
      icon: 'bi bi-type-bold',
      title: 'Bold',
      action: () => insertText('**', '**', 'bold text'),
      group: 'text'
    },
    {
      icon: 'bi bi-type-italic',
      title: 'Italic', 
      action: () => insertText('*', '*', 'italic text'),
      group: 'text'
    },
    {
      icon: 'bi bi-type-underline',
      title: 'Underline',
      action: () => insertText('__', '__', 'underlined text'),
      group: 'text'
    },
    {
      icon: 'bi bi-code',
      title: 'Inline Code',
      action: () => insertText('`', '`', 'code'),
      group: 'text'
    },
    {
      icon: 'bi bi-type-h1',
      title: 'Heading 1',
      action: () => insertText('\n# ', '\n', 'Heading 1'),
      group: 'headings'
    },
    {
      icon: 'bi bi-type-h2',
      title: 'Heading 2',
      action: () => insertText('\n## ', '\n', 'Heading 2'),
      group: 'headings'
    },
    {
      icon: 'bi bi-type-h3',
      title: 'Heading 3',
      action: () => insertText('\n### ', '\n', 'Heading 3'),
      group: 'headings'
    },
    {
      icon: 'bi bi-list-ul',
      title: 'Bullet List',
      action: () => insertText('\n- ', '\n', 'List item'),
      group: 'lists'
    },
    {
      icon: 'bi bi-list-ol',
      title: 'Numbered List',
      action: () => insertText('\n1. ', '\n', 'List item'),
      group: 'lists'
    },
    {
      icon: 'bi bi-check2-square',
      title: 'Checklist',
      action: () => insertText('\n- [ ] ', '\n', 'Todo item'),
      group: 'lists'
    },
    {
      icon: 'bi bi-link-45deg',
      title: 'Link',
      action: () => insertText('[', '](https://example.com)', 'link text'),
      group: 'media'
    },
    {
      icon: 'bi bi-image',
      title: 'Image',
      action: () => insertText('\n![', '](https://example.com/image.jpg)\n', 'alt text'),
      group: 'media'
    },
    {
      icon: 'bi bi-quote',
      title: 'Quote',
      action: () => insertText('\n> ', '\n', 'Quote text'),
      group: 'blocks'
    },
    {
      icon: 'bi bi-code-square',
      title: 'Code Block',
      action: () => insertText('\n```\n', '\n```\n', 'code here'),
      group: 'blocks'
    },
    {
      icon: 'bi bi-hr',
      title: 'Horizontal Line',
      action: () => insertText('\n---\n', '', ''),
      group: 'blocks'
    },
    {
      icon: 'bi bi-table',
      title: 'Table',
      action: () => insertText('\n| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n', '', ''),
      group: 'blocks'
    },
    {
      icon: 'bi bi-emoji-smile',
      title: 'Emoji',
      action: () => insertText('😊', '', ''),
      group: 'special'
    },
    {
      icon: 'bi bi-exclamation-triangle',
      title: 'Warning Box',
      action: () => insertText('\n⚠️ **Warning:** ', '\n', 'Important information here'),
      group: 'special'
    },
    {
      icon: 'bi bi-info-circle',
      title: 'Info Box',
      action: () => insertText('\n💡 **Note:** ', '\n', 'Additional information here'),
      group: 'special'
    }
  ];

  const buttonGroups = {
    text: 'Text Formatting',
    headings: 'Headings',
    lists: 'Lists',
    media: 'Media',
    blocks: 'Blocks',
    special: 'Special Elements'
  };

  const renderPreview = () => {
    if (!value) return <div className="text-muted p-4">Nothing to preview yet...</div>;
    
    // Simple markdown-like preview (basic implementation)
    let preview = value
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold and Italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      // Lists
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/^- \[ \] (.*$)/gm, '<li><input type="checkbox" disabled> $1</li>')
      .replace(/^- \[x\] (.*$)/gm, '<li><input type="checkbox" checked disabled> $1</li>')
      // Quotes
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #007bff;"><code>$1</code></pre>')
      // Horizontal rules
      .replace(/^---$/gm, '<hr style="border: 2px solid #dee2e6; margin: 2rem 0;">')
      // Tables (basic)
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map(cell => cell.trim());
        return '<tr>' + cells.map(cell => `<td style="border: 1px solid #dee2e6; padding: 0.5rem;">${cell}</td>`).join('') + '</tr>';
      })
      // Warning boxes
      .replace(/⚠️ \*\*(.*?)\*\*/g, '<div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; margin: 1rem 0; border-radius: 4px;"><strong>⚠️ Warning:</strong> $1</div>')
      // Info boxes
      .replace(/💡 \*\*(.*?)\*\*/g, '<div style="background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 1rem; margin: 1rem 0; border-radius: 4px;"><strong>💡 Note:</strong> $1</div>')
      // Line breaks
      .replace(/\n/g, '<br>');

    return (
      <div 
        className="preview-content p-4"
        dangerouslySetInnerHTML={{ __html: preview }}
        style={{ 
          minHeight: minHeight,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          fontSize: '1rem',
          lineHeight: '1.6'
        }}
      />
    );
  };

  return (
    <div className="rich-text-editor">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <Tabs activeKey={activeTab} onSelect={setActiveTab} className="border-0">
            <Tab eventKey="editor" title={
              <span><i className="bi bi-pencil me-2"></i>Editor</span>
            } />
            <Tab eventKey="preview" title={
              <span><i className="bi bi-eye me-2"></i>Preview</span>
            } />
          </Tabs>
        </Card.Header>

        <Card.Body className="p-0">
          {activeTab === 'editor' ? (
            <>
              {/* Toolbar */}
              <div className="toolbar p-3 border-bottom" style={{ background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)' }}>
                <div className="row">
                  {Object.entries(buttonGroups).map(([groupKey, groupLabel]) => (
                    <div key={groupKey} className="col-md-2 mb-3">
                      <div className="toolbar-group">
                        <small className="text-primary fw-bold d-block mb-2" style={{ fontSize: '0.75rem' }}>
                          {groupLabel}
                        </small>
                        <div className="d-flex flex-wrap gap-1">
                          {formatButtons
                            .filter(btn => btn.group === groupKey)
                            .map((button, index) => (
                              <Button
                                key={index}
                                variant="outline-primary"
                                onClick={button.action}
                                title={button.title}
                                size="sm"
                                className="border-0 shadow-sm"
                                style={{ 
                                  padding: '0.4rem 0.6rem',
                                  background: '#fff',
                                  borderRadius: '6px'
                                }}
                              >
                                <i className={button.icon}></i>
                              </Button>
                            ))
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div className="editor-area">
                <Form.Control
                  ref={textareaRef}
                  as="textarea"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  style={{
                    minHeight: minHeight,
                    border: 'none',
                    borderRadius: 0,
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    resize: 'vertical'
                  }}
                  className="border-0 shadow-none"
                />
              </div>

              {/* Helper Text */}
              <div className="bg-light p-2 border-top">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Supports Markdown formatting. Use the toolbar buttons or type directly. 
                  Switch to Preview tab to see how it will look.
                </small>
              </div>
            </>
          ) : (
            <div className="preview-area">
              <div className="p-3 border-bottom bg-light">
                <small className="text-muted fw-bold">
                  <i className="bi bi-eye me-1"></i>
                  Content Preview
                </small>
              </div>
              {renderPreview()}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default RichTextEditor;