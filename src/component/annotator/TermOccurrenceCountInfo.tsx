import React from "react";
import { TermData } from "../../model/Term";
import { useI18n } from "../hook/useI18n";
import { FormText } from "reactstrap";

const TermOccurrenceCountInfo: React.FC<{ term: TermData | null }> = ({
  term,
}) => {
  const { formatMessage } = useI18n();
  if (term == null) {
    return null;
  }
  const count = document
    .getElementById("annotator")!
    .querySelectorAll(`span[resource="${term.iri}"]`).length;
  return (
    <FormText>
      {formatMessage("annotator.highlight.countInfo", { count })}
    </FormText>
  );
};

export default TermOccurrenceCountInfo;
