import * as React from "react";
import Term from "../../model/Term";
import Utils from "../../util/Utils";
import { AiOutlineDisconnect } from "react-icons/ai";
import { UncontrolledTooltip } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import "./UnusedTermInfo.scss";

interface UnusedTermInfoProps {
  term: Term;
}

const UnusedTermInfo: React.FC<UnusedTermInfoProps> = (props) => {
  const { i18n } = useI18n();
  const id = "unused-term-info-" + Utils.hashCode(props.term.iri);
  return (
    <div className="unused-term-info" id={id}>
      <UncontrolledTooltip target={id}>
        {i18n("glossary.unusedTerm.tooltip")}
      </UncontrolledTooltip>
      <AiOutlineDisconnect />
    </div>
  );
};

export default UnusedTermInfo;
