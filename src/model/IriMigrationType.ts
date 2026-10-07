export enum IriMigrationType {
  VOCABULARY = "VOCABULARY",
  TERM = "TERM",
  CUSTOM_ATTRIBUTE = "CUSTOM_ATTRIBUTE",
}

export interface IriMigrationPair {
  originalIri: string;
  newIri: string;
}

export interface MigrationParams {
  newPreferredNamespaceUri?: string;
}
