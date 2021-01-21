import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import TermItFile from "../../../model/File";
import Utils from "../../../util/Utils";
import {Table} from "reactstrap";
import File from "../../../model/File";
import {connect} from "react-redux";
import TermItState from "../../../model/TermItState";

interface FilesProps extends HasI18n {
    files: TermItFile[];
    actions: JSX.Element[];
    itemActions: (file: TermItFile) => JSX.Element[];
}

export const Files = (props: FilesProps) => {
    const i18n = props.i18n;

    const header = <div id="document-files" className="d-flex flex-wrap justify-content-between">
        <h4>{i18n("vocabulary.detail.files")}</h4>
        {props.actions}
    </div>

    if (Utils.sanitizeArray(props.files).length > 0) {
        return <div>
            {header}
            <Table striped={true}>
                <thead>
                <tr>
                    <th>
                        {props.i18n("vocabulary.detail.files.file")}
                    </th>
                    <th className="fit-content">
                        {props.i18n("actions")}
                    </th>
                </tr>
                </thead>
                <tbody>
                {props.files.slice().sort(Utils.labelComparator).map((v: File) => <tr key={v.label}>
                    <td>
                        {v.label}
                    </td>
                    <td>
                        <div className="d-flex float-right">
                            {props.itemActions(v)}
                        </div>
                    </td>
                </tr>)}
                </tbody>
            </Table>
        </div>
    } else {
        return <div>
            {header}
            <div id="file-list-empty"
                 className="italics">{props.i18n("resource.metadata.document.files.empty")}</div>
        </div>;
    }
}

export default connect((state: TermItState) => {
    return {
        intl: state.intl,
        vocabulary: state.vocabulary
    };
})(injectIntl(withI18n(Files)));