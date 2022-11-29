import Constants from "../../util/Constants";

export enum ExportType {
  SKOS = "SKOS",
  SKOS_FULL = "SKOS_FULL",
  SKOS_WITH_REFERENCES = "SKOS_WITH_REFERENCES",
  SKOS_FULL_WITH_REFERENCES = "SKOS_FULL_WITH_REFERENCES",
}

export class ExportFormat {
  public static CSV: ExportFormat = new ExportFormat(Constants.CSV_MIME_TYPE);
  public static Excel: ExportFormat = new ExportFormat(
    Constants.EXCEL_MIME_TYPE
  );
  public static Turtle: ExportFormat = new ExportFormat(
    Constants.TTL_MIME_TYPE
  );
  public static RdfXml: ExportFormat = new ExportFormat(
    Constants.RDF_XML_MIME_TYPE
  );

  public readonly mimeType: string;

  constructor(mimeType: string) {
    this.mimeType = mimeType;
  }
}

export default class ExportConfig {
  public readonly type: ExportType;
  public readonly format: ExportFormat;
  public referenceProperties: string[] = [];

  constructor(type: ExportType, format: ExportFormat) {
    this.type = type;
    this.format = format;
  }
}
