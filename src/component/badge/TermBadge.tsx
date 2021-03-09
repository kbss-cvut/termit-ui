import * as React from "react";
import {Badge} from "reactstrap";
import classNames from "classnames";
import {useI18n} from "../hook/useI18n";

interface TermBadgeProps {
    className?: string;
}

const TermBadge: React.FC<TermBadgeProps> = (props: TermBadgeProps) => {
    const {i18n} = useI18n();
    return <Badge color="purple" className={classNames("asset-badge", props.className)}>{i18n("type.term")}</Badge>;
};


export default TermBadge;
