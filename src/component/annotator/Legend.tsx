import * as React from "react";
import { useI18n } from "../hook/useI18n";
import { useDispatch, useSelector } from "react-redux";
import { toggleAnnotatorLegendFilter } from "../../action/SyncActions";
import classNames from "classnames";
import TermItState from "../../model/TermItState";
import {
  AnnotationClass,
  AnnotationOrigin,
} from "../../model/AnnotatorLegendFilter";

const Legend: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch = useDispatch();
  const filter = useSelector(
    (state: TermItState) => state.annotatorLegendFilter
  );

  return (
    <ul className="legend-list">
      <li
        onClick={() =>
          dispatch(
            toggleAnnotatorLegendFilter(AnnotationClass.SUGGESTED_OCCURRENCE)
          )
        }
        className={classNames("suggested-term-occurrence legend-list-item", {
          "hidden-occurrence": !filter.get(
            AnnotationClass.SUGGESTED_OCCURRENCE
          ),
        })}
        title={i18n("annotator.legend.confirmed.unknown.term.tooltip")}
      >
        {i18n("annotator.legend.confirmed.unknown.term")}
      </li>
      <li
        onClick={() =>
          dispatch(
            toggleAnnotatorLegendFilter(AnnotationClass.ASSIGNED_OCCURRENCE)
          )
        }
        className={classNames("assigned-term-occurrence legend-list-item", {
          "hidden-occurrence": !filter.get(AnnotationClass.ASSIGNED_OCCURRENCE),
        })}
        title={i18n("annotator.legend.confirmed.existing.term.tooltip")}
      >
        {i18n("annotator.legend.confirmed.existing.term")}
      </li>
      <li
        onClick={() => {
          dispatch(toggleAnnotatorLegendFilter(AnnotationClass.DEFINITION));
        }}
        className={classNames("term-definition legend-list-item", {
          "hidden-occurrence": !filter.get(AnnotationClass.DEFINITION),
        })}
        title={i18n("annotator.legend.definition.tooltip")}
      >
        {i18n("annotator.legend.definition")}
      </li>
      <li
        onClick={() => {
          dispatch(
            toggleAnnotatorLegendFilter(AnnotationClass.PENDING_DEFINITION)
          );
        }}
        className={classNames("pending-term-definition legend-list-item", {
          "hidden-occurrence": !filter.get(AnnotationClass.PENDING_DEFINITION),
        })}
        title={i18n("annotator.legend.definition.pending.tooltip")}
      >
        {i18n("annotator.legend.definition.pending")}
      </li>
      <li
        onClick={() => {
          dispatch(
            toggleAnnotatorLegendFilter(
              AnnotationClass.SUGGESTED_OCCURRENCE,
              AnnotationOrigin.PROPOSED
            )
          );
        }}
        className={classNames(
          "proposed-occurrence suggested-term-occurrence legend-list-item",
          {
            "hidden-occurrence": !filter.get(
              AnnotationClass.SUGGESTED_OCCURRENCE,
              AnnotationOrigin.PROPOSED
            ),
          }
        )}
        title={i18n("annotator.legend.proposed.unknown.term.tooltip")}
      >
        {i18n("annotator.legend.proposed.unknown.term")}
      </li>
      <li
        onClick={() => {
          dispatch(
            toggleAnnotatorLegendFilter(
              AnnotationClass.ASSIGNED_OCCURRENCE,
              AnnotationOrigin.PROPOSED
            )
          );
        }}
        className={classNames(
          "proposed-occurrence assigned-term-occurrence legend-list-item",
          {
            "hidden-occurrence": !filter.get(
              AnnotationClass.ASSIGNED_OCCURRENCE,
              AnnotationOrigin.PROPOSED
            ),
          }
        )}
        title={i18n("annotator.legend.proposed.existing.term.tooltip")}
      >
        {i18n("annotator.legend.proposed.existing.term")}
      </li>
    </ul>
  );
};

export default Legend;
