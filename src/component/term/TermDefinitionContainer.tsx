import React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";

/**
 * Visual container for term definition-related attributes.
 */
export const TermDefinitionContainer: React.FC<HasI18n> = props => {
    const {i18n, children} = props;
    return <>
        <hr data-content={i18n("term.metadata.definition")} className="hr-definition-text"/>
        {children}
        <hr className="hr-definition"/>
    </>;
}

export default injectIntl(withI18n(TermDefinitionContainer));
