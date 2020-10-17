import * as React from "react";
import {Alert} from "reactstrap";
import VocabularyUtils from "../../../util/VocabularyUtils";

interface SeverityTextProps {
    severityIri: string;
    message: string;
}

const SeverityText = (props: SeverityTextProps) => (
    props.severityIri === VocabularyUtils.SH_VIOLATION ?
            <Alert color="danger">{props.message}</Alert> :
        (props.severityIri === VocabularyUtils.SH_WARNING ?
            <Alert color="warning">{props.message}</Alert> :
            <Alert color="info">{props.message}</Alert>)
)

export default SeverityText;