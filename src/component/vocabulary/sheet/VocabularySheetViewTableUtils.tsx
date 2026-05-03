import React from "react";
import Term from "../../../model/Term";
import {
  MultilingualString,
  getLocalized,
} from "../../../model/MultilingualString";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Utils from "../../../util/Utils";
import { OWL, SKOS } from "../../../util/Namespaces";
import { normalizeLanguageTag } from "../../../util/IntlUtil";

export interface TermsTableColumn {
  id:
    | "label"
    | "type"
    | "exactMatches"
    | "parentTerms"
    | "subTerms"
    | "relatedTerms"
    | "notation"
    | "scopeNote"
    | "example"
    | "status"
    | "definition";
  title: string;
  minWidthRem: number;
  growFr?: number;
  hideable: boolean;
  render: (term: Term, rowIndex: number) => React.ReactNode;
}

export function previewValues(values: string[]): React.ReactNode {
  const sanitized = Utils.sanitizeArray(values)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  if (sanitized.length === 0) {
    return "";
  }

  return (
    <span className="text-truncate d-block w-100">{sanitized.join(", ")}</span>
  );
}

export function resolveGridColumnWidth(column: TermsTableColumn): string {
  return column.growFr
    ? `minmax(${column.minWidthRem}rem, ${column.growFr}fr)`
    : `${column.minWidthRem}rem`;
}

export function resolveLocalizedTermLabel(
  item: { iri?: string; label?: MultilingualString },
  locale: string
): string {
  return (item.label ? getLocalized(item.label, locale) : "") || item.iri || "";
}

export function resolveTypeLabels(types?: string[]): string[] {
  return Utils.sanitizeArray(types)
    .filter(
      (typeIri) =>
        typeIri !== VocabularyUtils.TERM &&
        !typeIri.startsWith(OWL.namespace) &&
        !typeIri.startsWith(SKOS.namespace)
    )
    .map((typeIri) => {
      try {
        return VocabularyUtils.create(typeIri).fragment;
      } catch {
        return typeIri;
      }
    });
}

export function resolveAvailableTermLanguages(
  terms: Term[],
  preferredLanguage: string
): string[] {
  const seen = new Set<string>();

  terms.forEach((term) => {
    Term.getLanguages(term).forEach((language) => {
      const normalized = normalizeLanguageTag(language);
      if (normalized.length > 0) {
        seen.add(normalized);
      }
    });
  });

  const sorted = Array.from(seen).sort((a, b) => a.localeCompare(b));
  const normalizedPreferred = normalizeLanguageTag(preferredLanguage);

  if (normalizedPreferred && seen.has(normalizedPreferred)) {
    return [
      normalizedPreferred,
      ...sorted.filter((language) => language !== normalizedPreferred),
    ];
  }

  return sorted;
}
