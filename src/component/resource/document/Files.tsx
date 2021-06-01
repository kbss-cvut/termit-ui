import TermItFile from "../../../model/File";
import File from "../../../model/File";
import Utils from "../../../util/Utils";
import { ButtonToolbar, Label, Table } from "reactstrap";
import { connect } from "react-redux";
import TermItState from "../../../model/TermItState";
import { useI18n } from "../../hook/useI18n";

interface FilesProps {
  files: TermItFile[];
  actions: JSX.Element[];
  itemActions: (file: TermItFile) => JSX.Element[];
}

export const Files = (props: FilesProps) => {
  const { i18n } = useI18n();
  const files = Utils.sanitizeArray(props.files)
    .slice()
    .sort(Utils.labelComparator);
  return (
    <div>
      <Table>
        <tbody>
          <tr>
            <td>
              <Label className="attribute-label mb-3">
                {" "}
                {i18n("vocabulary.detail.files")}
              </Label>
            </td>
            <td className="fit-content">
              <div className="fit-content">{props.actions}</div>
            </td>
          </tr>
        </tbody>
      </Table>
      {files.length > 0 ? (
        <Table striped={true} bordered={true}>
          <tbody>
            {files.map((v: File) => (
              <tr key={v.label}>
                <td className="align-middle">{v.label}</td>
                <td className="align-middle">
                  <ButtonToolbar className="float-right">
                    {props.itemActions(v)}
                  </ButtonToolbar>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div id="file-list-empty" className="italics">
          {i18n("resource.metadata.document.files.empty")}
        </div>
      )}
    </div>
  );
};

export default connect((state: TermItState) => {
  return {
    intl: state.intl,
    vocabulary: state.vocabulary,
  };
})(Files);
