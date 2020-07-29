import * as React from "react";
import {injectIntl} from "react-intl";
import Term from "../../model/Term";
import "./UnusedTermInfo.scss";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Utils from "../../util/Utils";
import {AiOutlineDisconnect} from "react-icons/ai";
import {UncontrolledTooltip} from "reactstrap";

interface ImportedTermInfoProps extends HasI18n {
    term: Term;
}

const UnusedTermInfo: React.FC<ImportedTermInfoProps> = (props) => {
    const id = "unused-term-info-" + Utils.hashCode(props.term.iri);
    return <div className="unused-term-info" id={id}>
        <UncontrolledTooltip target={id}>
            {props.i18n("glossary.unusedTerm.tooltip")}
        </UncontrolledTooltip>
        <AiOutlineDisconnect/>
    </div>;
};

export default injectIntl(withI18n(UnusedTermInfo));
