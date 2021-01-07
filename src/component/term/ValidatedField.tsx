import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import "./TermMetadata.scss";
import ValidationResult from "../../model/ValidationResult";
import {ValidationUtils} from "./validation/ValidationUtils";
import {injectIntl} from "react-intl";
import {useState} from "react";
import {Tooltip} from 'reactstrap';
import _uniqueId from 'lodash/uniqueId';

interface ValidatedFieldProps extends HasI18n {
    results: ValidationResult[];
}

const ValidatedField: React.FC<ValidatedFieldProps> = ({
                                                           results,
                                                           locale,
                                                           children
                                                       }) => {
    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [id] = useState(_uniqueId("tooltip-"))
    const toggle = () => setTooltipOpen(!tooltipOpen);

    const containsQualityAffectingRule = results.find(r => ValidationUtils.qualityAffectingRules.indexOf(r.sourceShape?.iri) > -1);
    const messages = results.map(r => {
        const message = r.message.find(ls => ls.language === locale)!.value;
        return <li key={r.iri}>{message}</li>
    });
    const style = (results.length === 0) ? {} :
        {backgroundColor: containsQualityAffectingRule ? ValidationUtils.qualityAffectingRuleViolationColor : ValidationUtils.qualityNotAffectingRuleViolationColor}
    return <>
        <div id={id}
             style={style}>
            {children}
            {
                (results.length !== 0) ?
                    <Tooltip placement="auto"
                             isOpen={tooltipOpen}
                             target={id}
                             toggle={toggle}>
                        {messages}
                    </Tooltip> : undefined
            }
        </div>

    </>;
}

export default injectIntl(withI18n(ValidatedField));