import React from "react";
import classNames from "classnames";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useI18n } from "../../hook/useI18n";

interface ExpandableTextCellProps {
  text?: string;
  children?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ExpandableTextCell: React.FC<ExpandableTextCellProps> = ({
  text,
  children,
  isExpanded,
  onToggle,
}) => {
  const { i18n } = useI18n();
  const textRef = React.useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkTruncation = () => {
      if (!isExpanded) {
        const targetElement = el.firstElementChild || el;
        setIsTruncated(
          targetElement.scrollWidth > targetElement.clientWidth ||
            el.scrollWidth > el.clientWidth
        );
      }
    };

    checkTruncation();

    const resizeObserver = new ResizeObserver(() => {
      checkTruncation();
    });

    resizeObserver.observe(el);
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => resizeObserver.disconnect();
  }, []);

  if (!text && !children) {
    return null;
  }

  return (
    <div
      className={classNames("d-flex", "term-table-expandable-cell", {
        "term-table-expandable-cell-expanded": isExpanded,
      })}
    >
      <div
        className={classNames("term-table-list-wrapper", {
          "overflow-hidden": !isExpanded,
        })}
      >
        <span ref={textRef} className="term-table-definition d-block">
          {children || text}
        </span>
      </div>
      {(isTruncated || isExpanded) && (
        <button
          type="button"
          className="vocabulary-sheet-view-cell-expand-toggle"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          title={
            isExpanded
              ? i18n("glossary.table.cell.collapse")
              : i18n("glossary.table.cell.expand")
          }
          aria-label={
            isExpanded
              ? i18n("glossary.table.cell.collapse")
              : i18n("glossary.table.cell.expand")
          }
          aria-expanded={isExpanded}
        >
          <span className="vocabulary-sheet-view-cell-expand-icon">
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </button>
      )}
    </div>
  );
};
