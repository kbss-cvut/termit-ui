import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Badge} from "reactstrap";

interface VocabularyBadgeProps extends HasI18n {
    className?: string;
}

const VocabularyBadge: React.SFC<VocabularyBadgeProps> = (props: VocabularyBadgeProps) =>
    <Badge color="yellow"
           className={props.className}>{props.i18n("type.vocabulary")}</Badge>;


export default injectIntl(withI18n(VocabularyBadge));
