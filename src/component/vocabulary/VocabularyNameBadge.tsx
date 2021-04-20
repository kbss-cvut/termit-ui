import * as React from "react";
import {AssetData} from "../../model/Asset";
import {getVocabularyShortLabel} from "@opendata-mvcr/assembly-line-shared";
import {Badge} from "reactstrap";

interface VocabularyNameBadgeProps {
    vocabulary?: AssetData;
    className?: string;
}

const VocabularyNameBadge: React.FC<VocabularyNameBadgeProps> = props => {
    const {vocabulary, className} = props;
    if (!vocabulary) {
        return null;
    }
    return <Badge color="primary" className={className}>{getVocabularyShortLabel(vocabulary.iri!)}</Badge>;
};

export default VocabularyNameBadge;
