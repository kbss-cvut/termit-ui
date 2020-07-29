import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term from "../../model/Term";
import TermLink from "../term/TermLink";
import {injectIntl} from "react-intl";

interface TermDefinitionAnnotationViewProps extends HasI18n {
    term?: Term | null;
    resource?: string;
    textContent: string;
}

const TermDefinitionAnnotationView: React.FC<TermDefinitionAnnotationViewProps> = props => {
    const i18n = props.i18n;
    if (props.term) {
        return <table>
            <tbody>
            <tr>
                <td className="label">{i18n("annotation.definition.term")}</td>
                <td><TermLink term={props.term}/></td>
            </tr>
            </tbody>
        </table>
    } else {
        return <table>
            <tbody>
            <tr>
                <td className="label">{i18n("annotation.definition.definition")}</td>
                <td>{props.textContent}</td>
            </tr>
            </tbody>
        </table>
    }
};

export default injectIntl(withI18n(TermDefinitionAnnotationView));
