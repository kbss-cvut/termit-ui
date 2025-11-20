import VocabularyUtils from "../util/VocabularyUtils";

export const CONTEXT = {
  timestamp: {
    "@id": VocabularyUtils.CREATED,
    "@type": VocabularyUtils.XSD_DATETIME,
  },
  backupReason: VocabularyUtils.HAS_BACKUP_REASON,
};

/**
 * Dto used for description of a file backup created at {@link #timestamp}
 * with a {@link #backupReason}
 */
export default interface FileBackupDto {
  timestamp: string;
  backupReason: FileBackupReason;
}

export enum FileBackupReason {
  REUPLOAD = "REUPLOAD",
  TEXT_ANALYSIS = "TEXT_ANALYSIS",
  NEW_OCCURRENCE = "NEW_OCCURRENCE",
  REMOVE_OCCURRENCE = "REMOVE_OCCURRENCE",
  SCHEDULED = "SCHEDULED",
  BACKUP_RESTORE = "BACKUP_RESTORE",
  UNKNOWN = "UNKNOWN",
}
