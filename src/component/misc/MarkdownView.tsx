import React from "react";
import ReactMarkdown from "react-markdown";
import "./MarkdownView.scss";
import { ReactMarkdownProps } from "react-markdown/src/ast-to-react";
import classNames from "classnames";

const MarkdownImage = (
  props: React.ClassAttributes<HTMLImageElement> &
    React.ImgHTMLAttributes<HTMLImageElement> &
    ReactMarkdownProps
) => {
  const { node, alt, ...rest } = props;
  return <img style={{ maxWidth: "100%" }} alt={alt} {...rest} />;
};

interface MarkdownViewProps {
  children?: string;
  id?: string;
  className?: string;
}

/**
 * Markdown view.
 * Fixes styling collision with bootstrap (strong not being bold).
 */
const MarkdownView: React.FC<MarkdownViewProps> = ({
  children,
  id,
  className,
}) => {
  return (
    <div id={id} className={classNames("markdown-view", className)}>
      <ReactMarkdown components={{ img: MarkdownImage }} linkTarget="_blank">
        {children || ""}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownView;
