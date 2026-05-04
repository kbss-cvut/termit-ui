import React from "react";
import classNames from "classnames";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useI18n } from "../../hook/useI18n";
import Term, { TermInfo } from "../../../model/Term";
import { TermListPreview } from "../../term/TermListPreview";

interface ExpandableTermListCellProps {
  items: Array<Term | TermInfo>;
  locale: string;
  baseVocabularyIri?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const ExpandableTermListCell: React.FC<ExpandableTermListCellProps> = ({
  items,
  locale,
  baseVocabularyIri,
  isExpanded,
  onToggle,
}) => {
  const { i18n } = useI18n();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const previewSpan = el.firstElementChild as HTMLElement;
    const targetElement = previewSpan || el;

    const checkTruncation = () => {
      if (!isExpanded) {
        setIsTruncated(targetElement.scrollWidth > targetElement.clientWidth);
      }
    };

    checkTruncation();

    const resizeObserver = new ResizeObserver(() => {
      checkTruncation();
    });

    resizeObserver.observe(targetElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [items, isExpanded]);

  if (items.length === 0) return null;

  return (
    <div
      className={classNames("d-flex", "term-table-expandable-cell", {
        "term-table-expandable-cell-expanded": isExpanded,
      })}
    >
      <div
        ref={wrapperRef}
        className={classNames("term-table-list-wrapper", {
          "overflow-hidden": !isExpanded,
        })}
      >
        <TermListPreview
          items={items}
          locale={locale}
          baseVocabularyIri={baseVocabularyIri}
          expanded={isExpanded}
        />
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
