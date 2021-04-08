import * as React from "react";
import {Badge} from "reactstrap";
import classNames from "classnames";
import {useI18n} from "../hook/useI18n";

interface VocabularyBadgeProps {
    className?: string;
}

const VocabularyBadge: React.FC<VocabularyBadgeProps> = (props: VocabularyBadgeProps) => {
    const {i18n} = useI18n();
    return (
        <Badge color="yellow" className={classNames("asset-badge", props.className)}>
            {i18n("type.vocabulary")}
        </Badge>
    );
};

export default VocabularyBadge;
