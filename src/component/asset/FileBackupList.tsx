import * as React from "react";
import FileBackupDto from "../../model/FileBackupDto";
import { Button, ButtonToolbar, Table } from "reactstrap";
import { useI18n } from "../hook/useI18n";

import { FormattedDate, FormattedTime } from "react-intl";
import "./FileBackupList.scss";
import { GoHistory } from "react-icons/go";
import { FaDownload } from "react-icons/fa";

export interface FileBackupListProps {
  backups: FileBackupDto[];
  restoreBackup: (backup: FileBackupDto) => void;
}

const FileBackupList: React.FC<FileBackupListProps> = (props) => {
  const { i18n } = useI18n();

  return (
    <Table className={"file-backup-list"}>
      <thead>
        <tr>
          <th>{i18n("date")}</th>
          <th>{i18n("time")}</th>
          <th>{i18n("resource.file.backup.reason")}</th>
          <th className="text-center">{i18n("actions")}</th>
        </tr>
      </thead>
      <tbody>
        {props.backups.map((backup, backupIndex) => {
          const date = Date.parse(backup.timestamp);
          return (
            <tr key={`backup-dto-${backupIndex}`}>
              <td>
                <FormattedDate value={date} />
              </td>
              <td>
                <FormattedTime value={date} timeStyle="medium" />
              </td>
              <td>
                {i18n(
                  `resource.file.backup.reason.${backup.backupReason.toLowerCase()}`
                )}
              </td>
              <td>
                <ButtonToolbar className="justify-content-end">
                  <Button
                    color="primary"
                    size="sm"
                    onClick={() => props.restoreBackup(backup)}
                    title={i18n("resource.file.backup.restore")}
                  >
                    <GoHistory className="mr-1" />
                    {i18n("resource.file.backup.restore")}
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    title={i18n("resource.metadata.file.content.download")}
                  >
                    <FaDownload className="mr-1" />
                    {i18n("resource.metadata.file.content.download")}
                  </Button>
                </ButtonToolbar>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default FileBackupList;
