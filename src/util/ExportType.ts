import Constants from "./Constants";

export default class ExportType {

    public static CSV: ExportType = new ExportType(Constants.CSV_MIME_TYPE);
    public static Excel: ExportType = new ExportType(Constants.EXCEL_MIME_TYPE);
    public static Turtle: ExportType = new ExportType(Constants.TTL_MIME_TYPE);

    public readonly mimeType: string;

    constructor(mimeType: string) {
        this.mimeType = mimeType;
    }
}