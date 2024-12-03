import TermItFile from "../../../model/File";
import File from "../../../model/File";
import Utils from "../../../util/Utils";
import { Badge, ButtonToolbar, Label, Table } from "reactstrap";
import { useI18n } from "../../hook/useI18n";

interface FilesProps {
  files: TermItFile[];
  actions: JSX.Element[];
  itemActions: (file: TermItFile) => JSX.Element[];
}

const Files = (props: FilesProps) => {
  const { i18n } = useI18n();
  const files = Utils.sanitizeArray(props.files)
    .slice()
    .sort(Utils.labelComparator);
  return (
    <div>
      <Table>
        <tbody>
          <tr>
            <td className="align-middle">
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
        <Table striped={true} bordered={false}>
          <tbody>
            {files.map((v: File) => (
              <tr key={v.label}>
                <td className="align-middle">
                  {v.language && (
                    <Badge
                      color="primary"
                      className="mr-1 align-bottom"
                      title={i18n("file.language")}
                    >
                      {v.language}
                    </Badge>
                  )}
                  {v.label}
                </td>
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

export default Files;
