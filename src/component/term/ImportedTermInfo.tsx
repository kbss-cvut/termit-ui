import * as React from "react";
import Term from "../../model/Term";
import { GoFileSymlinkDirectory } from "react-icons/go";
import { UncontrolledTooltip } from "reactstrap";
import Utils from "../../util/Utils";
import AssetLabel from "../misc/AssetLabel";
import { useI18n } from "../hook/useI18n";

interface ImportedTermInfoProps {
  term: Term;
}

const ImportedTermInfo: React.FC<ImportedTermInfoProps> = (props) => {
  const { i18n } = useI18n();
  const id = "imported-term-info-" + Utils.hashCode(props.term.iri);
  return (
    <>
      <GoFileSymlinkDirectory id={id} className="term-tree-icon" />
      <UncontrolledTooltip target={id}>
        {i18n("glossary.importedTerm.tooltip")}
        &nbsp;
        <AssetLabel iri={props.term.vocabulary!.iri!} />
      </UncontrolledTooltip>
    </>
  );
};

export default ImportedTermInfo;
