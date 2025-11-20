import * as React from "react";
import FileBackupDto from "../../model/FileBackupDto";
import { Table } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { FormattedDate, FormattedTime } from "react-intl";
import "./FileBackupList.scss";

export interface FileBackupListProps {
  backups: FileBackupDto[];
}

const FileBackupList: React.FC<FileBackupListProps> = (props) => {
  const { i18n } = useI18n();
  let backupIndex = 0;
  console.debug(props.backups);

  return (
    <Table className={"file-backup-list"}>
      <tbody>
        {props.backups.map((backup) => {
          const date = Date.parse(backup.timestamp);
          return (
            <tr key={`backup-dto-${backupIndex++}`}>
              <td>
                <FormattedDate value={date} />
              </td>
              <td>
                <FormattedTime value={date} />
              </td>
              <td>
                {i18n(
                  `resource.file.backup.reason.${backup.backupReason.toLowerCase()}`
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default FileBackupList;
