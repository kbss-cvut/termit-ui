import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Badge} from "reactstrap";
import classNames from "classnames";

interface TermBadgeProps extends HasI18n {
    className?: string;
}

const TermBadge: React.FC<TermBadgeProps> = (props: TermBadgeProps) =>
    <Badge color="purple" className={classNames("asset-badge", props.className)}>{props.i18n("type.term")}</Badge>;


export default injectIntl(withI18n(TermBadge));
