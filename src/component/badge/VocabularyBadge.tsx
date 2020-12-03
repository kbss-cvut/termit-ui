import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Badge} from "reactstrap";
import classNames from "classnames";

interface VocabularyBadgeProps extends HasI18n {
    className?: string;
}

const VocabularyBadge: React.FC<VocabularyBadgeProps> = (props: VocabularyBadgeProps) =>
    <Badge color="yellow"
           className={classNames("asset-badge", props.className)}>{props.i18n("type.vocabulary")}</Badge>;


export default injectIntl(withI18n(VocabularyBadge));
