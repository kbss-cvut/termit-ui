import * as React from "react";
import {Alert} from "reactstrap";
import {ValidationUtils} from "./ValidationUtils";

interface ValidationMessageProps {
    sourceShapeIri: string;
    message: string;
}

const ValidationMessage = (props: ValidationMessageProps) =>
    ValidationUtils.qualityAffectingRules.indexOf(props.sourceShapeIri) > -1 ? (
        <Alert style={{backgroundColor: ValidationUtils.qualityAffectingRuleViolationColor}}>{props.message}</Alert>
    ) : (
        <Alert style={{backgroundColor: ValidationUtils.qualityNotAffectingRuleViolationColor}}>{props.message}</Alert>
    );

export default ValidationMessage;
