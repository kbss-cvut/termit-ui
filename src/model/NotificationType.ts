/**
 * Possible types of notification source.
 *
 * These basically complement actions in situations where full-blown actions are not relevant for a notification.
 */
const NotificationType = {
  TERM_HIERARCHY_UPDATED: "TERM_HIERARCHY_UPDATED",
  FILE_CONTENT_UPLOADED: "FILE_CONTENT_UPLOADED",
  TEXT_ANALYSIS_FINISHED: "TEXT_ANALYSIS_FINISHED",
  ASSET_UPDATED: "ASSET_UPDATED",
  SNAPSHOT_COUNT_CHANGED: "SNAPSHOT_COUNT_CHANGED",
};

export default NotificationType;
