import * as React from "react";
import { useEffect, useState } from "react";
import TermItFile from "../../model/File";
import { PageRequest, ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import {
  exportFileContent,
  loadFileBackups,
  restoreFileBackup,
} from "../../action/AsyncResourceActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import FileBackupList from "./FileBackupList";
import FileBackupDto from "../../model/FileBackupDto";
import SingleActionDialog from "../misc/SingleActionDialog";
import { useI18n } from "../hook/useI18n";
import Pagination, { PaginationApi } from "../misc/table/Pagination";

interface RestoreFileBackupDialogProps {
  show: boolean;
  onClose: () => void;
  file: TermItFile;
  totalBackupsCount: number;
}

const ITEMS_PER_PAGE = 10;

const FILE_BACKUP_LIST_PROMISE_AREA = "file-backup-list";

const RestoreFileBackupDialog: React.FC<RestoreFileBackupDialogProps> = (
  props
) => {
  const { i18n } = useI18n();
  const [backups, setBackups] = useState<FileBackupDto[]>([]);
  const [page, setPage] = useState(0);
  const dispatch: ThunkDispatch = useDispatch();
  const pageCount = Math.ceil(props.totalBackupsCount / ITEMS_PER_PAGE);

  const paginationTable = React.useMemo<PaginationApi>(
    () => ({
      getState: () => ({
        pagination: {
          pageIndex: page,
          pageSize: ITEMS_PER_PAGE,
        },
      }),
      getPageCount: () => pageCount,
      getCanPreviousPage: () => page > 0,
      getCanNextPage: () => page < pageCount - 1,
      setPageIndex: (index: number) => setPage(index),
      previousPage: () => setPage((p) => Math.max(p - 1, 0)),
      nextPage: () =>
        setPage((p) => Math.min(p + 1, Math.max(pageCount - 1, 0))),
      setPageSize: () => undefined,
    }),
    [page, pageCount]
  );

  useEffect(() => {
    if (!props.show) return;
    const iri = VocabularyUtils.create(props.file.iri);
    const pageRequest: PageRequest = {
      page,
      size: ITEMS_PER_PAGE,
    };

    trackPromise(
      dispatch(loadFileBackups(iri, pageRequest)),
      FILE_BACKUP_LIST_PROMISE_AREA
    ).then((array) => {
      if (array) {
        setBackups(array);
      } else {
        setBackups([]);
      }
    });
  }, [props.file, props.show, page, dispatch]);

  const restoreBackup = (backup: FileBackupDto) => {
    const iri = VocabularyUtils.create(props.file.iri);
    dispatch(restoreFileBackup(iri, backup));
    props.onClose();
  };

  const downloadBackup = (backup: FileBackupDto) => {
    const iri = VocabularyUtils.create(props.file.iri);
    trackPromise(
      dispatch(exportFileContent(iri, { at: backup.timestamp })),
      FILE_BACKUP_LIST_PROMISE_AREA
    );
  };

  return (
    <SingleActionDialog
      show={props.show}
      id="restore-file-backup-dialog"
      actionButtonText={i18n("close")}
      onClose={props.onClose}
      onAction={props.onClose}
      title={i18n("backups")}
      size="lg"
    >
      <PromiseTrackingMask area={FILE_BACKUP_LIST_PROMISE_AREA} />
      <FileBackupList
        backups={backups}
        restoreBackup={restoreBackup}
        downloadBackup={downloadBackup}
      />
      <Pagination table={paginationTable} allowSizeChange={false} />
    </SingleActionDialog>
  );
};

export default RestoreFileBackupDialog;
