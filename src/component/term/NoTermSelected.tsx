import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";

// TODO Instead of this, a component containing some statistics about the vocabulary should be rendered
const NoTermSelected: React.FC<HasI18n> = (props: HasI18n) => {
    return <div className="flex-grow-1 italics">{props.i18n("vocabulary.detail.noTermSelected")}</div>;
};

export default injectIntl(withI18n(NoTermSelected));