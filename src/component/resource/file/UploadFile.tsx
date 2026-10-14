import * as React from "react";
import { useCallback } from "react";
import { Col, FormGroup, FormText, Label, Row } from "reactstrap";
import Dropzone from "react-dropzone";
import { FaCloudUploadAlt } from "react-icons/fa";
import classNames from "classnames";
import { useI18n } from "../../hook/useI18n";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import "./UploadFile.scss";
import ValidationResult, {
  Severity,
} from "../../../model/form/ValidationResult";
import { renderValidationMessages } from "../../misc/AbstractInput";
import Utils from "../../../util/Utils";

const BYTES_PER_UNIT = 1024;
const UNITS = ["B", "KB", "MB", "GB", "TB"];

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return "0B";
  }

  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_UNIT));
  return (
    parseFloat((bytes / Math.pow(BYTES_PER_UNIT, i)).toFixed(dm)) +
    " " +
    UNITS[i]
  );
}

function isFileSizeValid(fileSize: number, limitStr: string) {
  return fileSize < limitStringToBytes(limitStr);
}

function limitStringToBytes(limitStr: string) {
  let limit = "";
  let i = 0;
  let char = limitStr.charAt(i);
  while (char >= "0" && char <= "9") {
    limit += char;
    i++;
    char = limitStr.charAt(i);
  }
  const unit = limitStr.substring(i).toUpperCase();
  const unitIndex = UNITS.indexOf(unit);
  return Number(limit) * Math.pow(BYTES_PER_UNIT, unitIndex);
}

interface UploadFileProps {
  setFile: (file: File) => void;
  labelKey?: string;
  accept?: string | string[];
  validation?: ValidationResult | ValidationResult[];
}

export const UploadFile: React.FC<UploadFileProps> = ({
  setFile,
  labelKey = "resource.create.file.select.label",
  accept,
  validation,
}) => {
  const [currentFile, setCurrentFile] = React.useState<File | undefined>();
  const [dragActive, setDragActive] = React.useState(false);
  const { i18n, formatMessage } = useI18n();
  const serverConfig = useSelector((state: TermItState) => state.configuration);
  const onFileSelected = (files: File[]) => {
    const file = files[0];
    setDragActive(false);
    setCurrentFile(file);
    if (file && isFileSizeValid(file.size, serverConfig.maxFileUploadSize)) {
      setFile(file);
    }
  };

  const containerClasses = classNames("create-resource-dropzone", {
    active: dragActive,
  });

  const renderValidation = useCallback(() => {
    const messages = Utils.sanitizeArray(validation).filter(
      (result) => !!result.message || !!result.messageId
    );
    return renderValidationMessages(messages);
  }, [validation]);

  const isInvalid = !!Utils.sanitizeArray(validation).find(
    (r) => r.severity === Severity.BLOCKER
  );

  return (
    <Row>
      <Col xs={12}>
        <FormGroup className={classNames({ invalid: isInvalid })}>
          <Dropzone
            onDrop={onFileSelected}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            multiple={false}
            accept={accept}
          >
            {({ getRootProps, getInputProps }) => (
              <>
                <div {...getRootProps()} className={containerClasses}>
                  <input {...getInputProps()} />
                  <div>
                    <Label className="placeholder-text w-100 text-center">
                      {i18n(labelKey)}
                    </Label>
                  </div>
                  <div className="w-100 icon-container text-center">
                    <FaCloudUploadAlt />
                  </div>
                  {currentFile && (
                    <div className="w-100 text-center">
                      <Label>
                        {currentFile.name +
                          " - " +
                          formatBytes(currentFile.size)}
                      </Label>
                      {!isFileSizeValid(
                        currentFile.size,
                        serverConfig.maxFileUploadSize
                      ) && (
                        <div className="font-italic text-danger">
                          {i18n("file.upload.size.exceeded")}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <FormText>
                  {formatMessage("file.upload.hint", {
                    maxUploadFileSize: serverConfig.maxFileUploadSize,
                  })}
                </FormText>
                {renderValidation()}
              </>
            )}
          </Dropzone>
        </FormGroup>
      </Col>
    </Row>
  );
};

export default UploadFile;
