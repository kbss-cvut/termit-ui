import * as React from "react";
import FileBackupDto from "../../model/FileBackupDto";
import { Button, Table } from "reactstrap";
import { useI18n } from "../hook/useI18n";

import { FormattedDate, FormattedTime } from "react-intl";
import "./FileBackupList.scss";
import { GoHistory } from "react-icons/go";

export interface FileBackupListProps {
  backups: FileBackupDto[];
  restoreBackup: (backup: FileBackupDto) => void;
}

const FileBackupList: React.FC<FileBackupListProps> = (props) => {
  const { i18n } = useI18n();
  let backupIndex = 0;

  return (
    <Table className={"file-backup-list"}>
      <thead>
        <tr>
          <th>{i18n("date")}</th>
          <th>{i18n("time")}</th>
          <th>{i18n("resource.file.backup.reason")}</th>
          <th></th>
        </tr>
      </thead>
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
              <td>
                <Button
                  color="outline-dark"
                  size={"sm"}
                  onClick={() => props.restoreBackup(backup)}
                  title={i18n("resource.file.backup.restore")}
                >
                  <GoHistory />
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default FileBackupList;
