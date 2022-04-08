import React from "react";
import ReactMarkdown from "react-markdown";
import "./MarkdownView.scss";

/**
 * Markdown view.
 * Fixes styling collision with bootstrap (strong not being bold).
 */
const MarkdownView: React.FC<{ children?: string }> = ({ children }) => {
  return (
    <div className="markdown-view">
      <ReactMarkdown>{children || ""}</ReactMarkdown>
    </div>
  );
};

export default MarkdownView;
