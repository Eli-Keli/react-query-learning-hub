import React, { useEffect, useState } from 'react';
import { BookOpen, Loader2 } from 'lucide-react';

export const DocViewer = () => {
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the markdown guide from the public directory
    fetch('/react-query-guide.md')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch guide');
        return res.text();
      })
      .then((data) => {
        setMarkdown(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setMarkdown('# Error\nFailed to load the React Query Guide.');
        setLoading(false);
      });
  }, []);

  // A simple, clean, lightweight Markdown-to-JSX parser
  // tailored specifically to render our developer guide beautifully.
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    let inCodeBlock = false;
    let codeContent: string[] = [];
    const elements: React.JSX.Element[] = [];
    let listItems: React.JSX.Element[] = [];

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(<ul key={`list-${key}`} className="doc-list">{...listItems}</ul>);
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      // 1. Code Block Handler
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // Closing code block
          inCodeBlock = false;
          elements.push(
            <pre key={`code-${index}`} className="doc-code-block">
              <code>{codeContent.join('\n')}</code>
            </pre>
          );
          codeContent = [];
        } else {
          // Opening code block
          flushList(index);
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return;
      }

      // 2. Headings
      if (line.startsWith('# ')) {
        flushList(index);
        elements.push(<h1 key={index} className="doc-h1">{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList(index);
        elements.push(<h2 key={index} className="doc-h2">{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList(index);
        elements.push(<h3 key={index} className="doc-h3">{line.slice(4)}</h3>);
      } 
      // 3. Lists
      else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const text = line.trim().slice(2);
        listItems.push(<li key={`li-${index}`} className="doc-li">{parseInlineStyles(text)}</li>);
      } 
      // 4. Horizontal Rule
      else if (line.trim() === '---') {
        flushList(index);
        elements.push(<hr key={index} className="doc-hr" />);
      } 
      // 5. Normal paragraphs or empty space
      else {
        flushList(index);
        if (line.trim() !== '') {
          elements.push(<p key={index} className="doc-p">{parseInlineStyles(line)}</p>);
        }
      }
    });

    // Flush any remaining list
    flushList(lines.length);

    return elements;
  };

  // Parses basic inline markdown style markers like **bold** and `code`
  const parseInlineStyles = (text: string) => {
    // Regex for inline code formatting `code`
    // and bold formatting **bold**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="doc-inline-code">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="card doc-card">
      <div className="card-header">
        <div className="header-title">
          <BookOpen className="icon text-secondary" size={20} />
          <h2>Documentation Viewer</h2>
        </div>
      </div>
      
      {loading ? (
        <div className="doc-loader">
          <Loader2 className="animate-spin text-secondary" size={24} />
          <p>Loading developer guide...</p>
        </div>
      ) : (
        <div className="doc-content animate-fade-in">
          {renderMarkdown(markdown)}
        </div>
      )}
    </div>
  );
};
