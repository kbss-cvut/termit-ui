import * as React from "react";
import {injectIntl} from "react-intl";
import Term from "../../model/Term";
import {GoFileSymlinkDirectory} from "react-icons/go";
import "./ImportedTermInfo.scss";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {UncontrolledTooltip} from "reactstrap";
import Utils from "../../util/Utils";
import AssetLabel from "../misc/AssetLabel";

interface ImportedTermInfoProps extends HasI18n {
    term: Term;
}

const ImportedTermInfo: React.FC<ImportedTermInfoProps> = (props) => {
    const id = "imported-term-info-" + Utils.hashCode(props.term.iri);
    return <div className="imported-term-info" id={id}>
        <UncontrolledTooltip target={id}>
            {props.i18n("glossary.importedTerm.tooltip")}
            &nbsp;
            <AssetLabel iri={props.term.vocabulary!.iri!}/>
        </UncontrolledTooltip>
        <GoFileSymlinkDirectory/>
    </div>;
};

export default injectIntl(withI18n(ImportedTermInfo));
