import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import TermItFile from "../../../model/File";
import Utils from "../../../util/Utils";
import {Label, Table} from "reactstrap";
import File from "../../../model/File";
import {connect} from "react-redux";
import TermItState from "../../../model/TermItState";

interface FilesProps extends HasI18n {
    files: TermItFile[];
    actions: JSX.Element[];
    itemActions: (file: TermItFile) => JSX.Element[];
}

export const Files = (props: FilesProps) => {
    return <div>
        <tr>
            <td><Label className="attribute-label mb-3"> {props.i18n("vocabulary.detail.files")}</Label></td>
            <td className="fit-content">
                <div className="fit-content">
                    {props.actions}
                </div>
            </td>
        </tr>
        <Table striped={true} bordered={true}>
            <tbody>
            {(Utils.sanitizeArray(props.files).length > 0) ? props.files.slice().sort(Utils.labelComparator).map((v: File) =>
                <tr key={v.label}>
                    <td>
                        {v.label}
                    </td>
                    <td>
                        <div className="d-flex float-right">
                            {props.itemActions(v)}
                        </div>
                    </td>
                </tr>) : <div id="file-list-empty"
                              className="italics">{props.i18n("resource.metadata.document.files.empty")}</div>
            }
            </tbody>
        </Table>
    </div>
}

export default connect((state: TermItState) => {
    return {
        intl: state.intl,
        vocabulary: state.vocabulary
    };
})(injectIntl(withI18n(Files)));