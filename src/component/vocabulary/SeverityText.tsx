import * as React from "react";
import {Alert} from "reactstrap";

interface SeverityTextProps {
    severityIri: string;
    message: string;
}

const SeverityText = (props: SeverityTextProps) => (
    props.severityIri === "http://www.w3.org/ns/shacl#Violation" ?
            <Alert color="danger">{props.message}</Alert> :
        (props.severityIri === "http://www.w3.org/ns/shacl#Warning" ?
            <Alert color="warning">{props.message}</Alert> :
            <Alert color="info">{props.message}</Alert>)
)

export default SeverityText;