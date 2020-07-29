import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term from "../../model/Term";
import TermLink from "../term/TermLink";
import {AnnotationClass} from "./Annotation";
import {injectIntl} from "react-intl";

interface TermOccurrenceAnnotationViewProps extends HasI18n {
    term?: Term | null;
    score?: string;
    resource?: string;
    annotationClass: string;
}

const TermOccurrenceAnnotationView: React.FC<TermOccurrenceAnnotationViewProps> = props => {
    const i18n = props.i18n;
    switch (props.annotationClass) {
        case AnnotationClass.ASSIGNED_OCCURRENCE:
            return <table>
                <tbody>
                <tr>
                    <td className={"label"}>{i18n("annotation.term.assigned-occurrence.termLabel")}</td>
                    <td><TermLink term={props.term!}/></td>
                </tr>
                </tbody>
            </table>;
        case AnnotationClass.SUGGESTED_OCCURRENCE:
            return <span className="an-warning">
                    {i18n("annotation.form.suggested-occurrence.message")}
                    </span>;
        case AnnotationClass.INVALID:
            return <span className="an-error">
                        {props.formatMessage("annotation.form.invalid-occurrence.message", {term: props.term ? props.term.iri : props.resource})}
                    </span>;
    }
    return <div/>;
};

export default injectIntl(withI18n(TermOccurrenceAnnotationView));
