import * as React from "react";
import {injectIntl} from "react-intl";
import {ErrorLogItem} from "../../model/ErrorInfo";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {Button, Table} from "reactstrap";
import {ThunkDispatch} from "../../util/Types";
import {clearErrors} from "../../action/SyncActions";
import {GoTrashcan} from "react-icons/go";

interface ErrorLogViewerProps extends HasI18n {
    errors: ErrorLogItem[];
    clearErrors: () => void;
}

export const ErrorLogViewer: React.SFC<ErrorLogViewerProps> = (props) => {
    const i18n = props.i18n;
    const errors = props.errors;
    return <div>
        <Table striped={true}>
            <thead>
            <tr>
                <th className="col-xs-3 align-middle">
                    <div>{i18n("log-viewer.timestamp")}</div>
                </th>
                <th className="col-xs-9 align-items-center d-flex">
                    <div className="flex-grow-1">{i18n("log-viewer.error")}</div>
                    <div className="float-sm-right">
                        <Button id="log-viewer-clear" size="sm" color="danger" outline={true}
                                onClick={props.clearErrors}>
                            <GoTrashcan/>
                            {i18n("log-viewer.clear")}
                        </Button>
                    </div>
                </th>
            </tr>
            </thead>
            <tbody>
            {errors.map(item => {
                let error = item.error;
                if (error.messageId) {
                    error = Object.assign({}, error, {message: i18n(error.messageId)});
                }
                return <tr key={item.timestamp}>
                    <td className="error-log-timestamp">{new Date(item.timestamp).toLocaleString(props.locale)}</td>
                    <td className="error-log-value">{JSON.stringify(error, null, 2)}</td>
                </tr>
            })}
            </tbody>
        </Table>
    </div>;
};

export default connect((state: TermItState) => {
    return {
        errors: state.errors
    };
}, (dispatch: ThunkDispatch) => {
    return {
        clearErrors: () => dispatch(clearErrors())
    };
})(injectIntl(withI18n(ErrorLogViewer)));