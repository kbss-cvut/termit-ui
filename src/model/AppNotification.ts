/**
 * Represents internal notification system of the application.
 *
 * Notifications can be used to facilitate communication between components which cannot be expressed in terms of data
 * stored in Redux store.
 */
import Asset from "./Asset";

export default interface AppNotification {
  source: any;
}

export interface AssetUpdateNotification<T extends Asset>
  extends AppNotification {
  original: T;
  updated: T;
}
