import * as React from "react";
import Term from "../../model/Term";
import TermLink from "../term/TermLink";
import {useI18n} from "../hook/useI18n";

interface TermDefinitionAnnotationViewProps {
    term?: Term | null;
    resource?: string;
    textContent: string;
}

const TermDefinitionAnnotationView: React.FC<TermDefinitionAnnotationViewProps> = props => {
    const {i18n} = useI18n();
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

export default TermDefinitionAnnotationView;
