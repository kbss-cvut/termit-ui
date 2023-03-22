import * as React from "react";
import { useSelector } from "react-redux";
import Term from "../../model/Term";
import TermItState from "../../model/TermItState";
import { Badge } from "reactstrap";
import Utils from "../../util/Utils";
import ValidationResult from "../../model/ValidationResult";
import Routing from "../../util/Routing";
import Validation from "../../util/Validation";
import { useI18n } from "../hook/useI18n";
import { useLocation } from "react-router-dom";

interface TermQualityBadgeProps {
  term: Term | null;
}

function computeScore(results: ValidationResult[]): number | undefined {
  return results.reduce((reduceScore, result) => {
    if (
      Validation.QUALITY_AFFECTING_RULES.indexOf(result.sourceShape?.iri) >= 0
    ) {
      return (
        reduceScore -
        Math.floor(100 / Validation.QUALITY_AFFECTING_RULES.length)
      );
    }
    return reduceScore;
  }, 100);
}

function resolveBadgeColor(score: number | undefined): string {
  switch (score) {
    case 100:
      return "dark-green";
    case 75:
    case 50:
      return "dark-yellow";
    case 25:
    case 0:
      return "dark-red";
    default:
      return "gray";
  }
}

const TermQualityBadge: React.FC<TermQualityBadgeProps> = ({ term }) => {
  const { formatMessage } = useI18n();
  const validationResults = useSelector(
    (state: TermItState) => state.validationResults[state.vocabulary.iri]
  );
  const location = useLocation();
  const onClick = () => {
    const namespace = Utils.extractQueryParam(location.search, "namespace");
    const query = new Map();
    if (namespace) {
      query.set("namespace", namespace);
    }
    query.set("activeTab", "term.metadata.validation.title");
    Routing.transitionToAsset(term!, { query });
  };

  let score: number | undefined;
  if (validationResults) {
    const res = validationResults[term!.iri] || [];
    score = res ? computeScore(res) : undefined;
  }
  return score === undefined ? (
    <></>
  ) : (
    <Badge
      color={resolveBadgeColor(score)}
      className="term-quality-badge"
      title={formatMessage("term.badge.score.tooltip", { score })}
      onClick={onClick}
    >
      &nbsp;
    </Badge>
  );
};

export default TermQualityBadge;
