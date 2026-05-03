import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import Term, { TermInfo } from "../../model/Term";
import { MultilingualString } from "../../model/MultilingualString";
import Utils from "../../util/Utils";
import VocabularyNameBadgeButton from "../vocabulary/VocabularyNameBadgeButton";
import { resolveLocalizedTermLabel } from "../vocabulary/sheet/VocabularySheetViewTableUtils";
import { getTermPath } from "./TermLink";
import { resolveVocabularyFragment } from "../../util/VocabularyUtils";

interface TermListPreviewProps {
  items: Array<Term | TermInfo> | undefined;
  locale: string;
  baseVocabularyIri?: string;
  expanded?: boolean;
}

export const TermListPreview: React.FC<TermListPreviewProps> = ({
  items,
  locale,
  baseVocabularyIri,
  expanded = false,
}) => {
  const sanitized = Utils.sanitizeArray(items) as Array<Term | TermInfo>;

  if (sanitized.length === 0) {
    return null;
  }

  return (
    <span
      className={classNames("term-table-list-preview d-block w-100", {
        "term-table-list-preview-expanded": expanded,
        "term-table-list-preview-collapsed": !expanded,
      })}
    >
      {sanitized.map((item, index) => {
        const fallbackLabel =
          resolveLocalizedTermLabel(item, locale) ||
          resolveVocabularyFragment(item.iri);
        const vocabulary = item.vocabulary;
        const hasNavigableVocabulary = !!vocabulary?.iri;
        const showBadge =
          vocabulary?.iri &&
          baseVocabularyIri &&
          vocabulary.iri !== baseVocabularyIri;
        const isLast = index === sanitized.length - 1;

        return (
          <React.Fragment key={item.iri || `${index}`}>
            {item.iri && hasNavigableVocabulary ? (
              <span className="term-badge-wrapper">
                <Link
                  to={getTermPath({
                    iri: item.iri,
                    label:
                      item.label && Object.keys(item.label).length > 0
                        ? item.label
                        : ({ [locale]: fallbackLabel } as MultilingualString),
                    vocabulary,
                    state: item.state,
                    types: item.types,
                  } as TermInfo)}
                  className="term-table-inline-link"
                  title={fallbackLabel}
                >
                  {fallbackLabel}
                </Link>
                {showBadge && (
                  <VocabularyNameBadgeButton
                    vocabulary={vocabulary}
                    termIri={item.iri}
                    className="ml-2 flex-shrink-0"
                  />
                )}
              </span>
            ) : (
              <span>{fallbackLabel}</span>
            )}
            {!isLast && <>, </>}
          </React.Fragment>
        );
      })}
    </span>
  );
};
