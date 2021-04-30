import * as React from "react";
import { useI18n } from "../hook/useI18n";

const Legend: React.FC = () => {
  const { i18n } = useI18n();
  return (
    <ul className="legend-list">
      <li
        className="suggested-term-occurrence legend-list-item"
        title={i18n("annotator.legend.confirmed.unknown.term.tooltip")}
      >
        {i18n("annotator.legend.confirmed.unknown.term")}
      </li>
      <li
        className="assigned-term-occurrence legend-list-item"
        title={i18n("annotator.legend.confirmed.existing.term.tooltip")}
      >
        {i18n("annotator.legend.confirmed.existing.term")}
      </li>
      <li
        className="term-definition legend-list-item"
        title={i18n("annotator.legend.definition.tooltip")}
      >
        {i18n("annotator.legend.definition")}
      </li>
      <li
        className="pending-term-definition legend-list-item"
        title={i18n("annotator.legend.definition.pending.tooltip")}
      >
        {i18n("annotator.legend.definition.pending")}
      </li>
      <li
        className="proposed-occurrence suggested-term-occurrence legend-list-item"
        title={i18n("annotator.legend.proposed.unknown.term.tooltip")}
      >
        {i18n("annotator.legend.proposed.unknown.term")}
      </li>
      <li
        className="proposed-occurrence assigned-term-occurrence legend-list-item"
        title={i18n("annotator.legend.proposed.existing.term.tooltip")}
      >
        {i18n("annotator.legend.proposed.existing.term")}
      </li>
    </ul>
  );
};

export default Legend;
