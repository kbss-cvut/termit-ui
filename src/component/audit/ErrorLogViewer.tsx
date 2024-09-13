import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { Button, Table } from "reactstrap";
import { ThunkDispatch } from "../../util/Types";
import { clearErrors } from "../../action/SyncActions";
import { GoTrashcan } from "react-icons/go";
import { useI18n } from "../hook/useI18n";

const ErrorLogViewer: React.FC = () => {
  const { i18n, formatMessage, locale } = useI18n();
  const errors = useSelector((state: TermItState) => state.errors);
  const dispatch: ThunkDispatch = useDispatch();
  const clear = () => {
    dispatch(clearErrors());
  };
  return (
    <div>
      <Table striped={true}>
        <thead>
          <tr>
            <th className="col-xs-3 align-middle">
              <div>{i18n("log-viewer.timestamp")}</div>
            </th>
            <th className="col-xs-9 align-items-center d-flex">
              <div className="flex-grow-1">{i18n("log-viewer.error")}</div>
              <div className="float-sm-right">
                <Button
                  id="log-viewer-clear"
                  size="sm"
                  color="danger"
                  outline={true}
                  onClick={clear}
                >
                  <GoTrashcan />
                  {i18n("log-viewer.clear")}
                </Button>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {errors.map((item) => {
            let error = item.error;
            if (error.messageId) {
              if (error.values && Object.keys(error.values).length > 0) {
                error = Object.assign({}, error, {
                  message: formatMessage(error.messageId, error.values),
                });
              } else {
                error = Object.assign({}, error, {
                  message: i18n(error.messageId),
                });
              }
            }
            return (
              <tr key={item.timestamp}>
                <td className="error-log-timestamp">
                  {new Date(item.timestamp).toLocaleString(locale)}
                </td>
                <td className="error-log-value">
                  {JSON.stringify(error, null, 2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default ErrorLogViewer;
