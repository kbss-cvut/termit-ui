import * as React from "react";
import { FaSort, FaSortAlphaDown, FaSortAlphaDownAlt } from "react-icons/fa";
import { useI18n } from "../../hook/useI18n";

interface SortToggleProps {
  onClick?: React.MouseEventHandler<HTMLElement>;
  desc?: boolean;
  isSorted?: boolean;
}

const AlphaNumSortToggle: React.FC<SortToggleProps> = ({
  onClick,
  isSorted,
  desc,
}) => {
  const { i18n } = useI18n();

  return (
    <span
      role="button"
      tabIndex={0}
      className="sort-icon ml-1"
      title={i18n("table.sort.tooltip")}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e as any);
        }
      }}
    >
      {isSorted ? (
        desc ? (
          <FaSortAlphaDownAlt />
        ) : (
          <FaSortAlphaDown />
        )
      ) : (
        <FaSort />
      )}
    </span>
  );
};

export default AlphaNumSortToggle;
