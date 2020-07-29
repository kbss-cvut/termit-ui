import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Badge} from "reactstrap";
import Utils from "../../util/Utils";
import {HasTypes} from "../../model/Asset";

interface ResourceBadgeProps extends HasI18n {
    resource?: HasTypes;
    className?: string;
}

const ResourceBadge: React.FC<ResourceBadgeProps> = (props: ResourceBadgeProps) => {
    let typeLabel = props.resource ? Utils.getAssetTypeLabelId(props.resource) : "type.resource";
    if (!typeLabel) {
        typeLabel = "type.resource";
    }
    return <Badge color="orange" className={props.className}>{props.i18n(typeLabel)}</Badge>;
};

export default injectIntl(withI18n(ResourceBadge));
