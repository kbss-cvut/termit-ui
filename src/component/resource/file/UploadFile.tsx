import * as React from "react";
import { Col, FormGroup, FormText, Label, Row } from "reactstrap";
import Dropzone from "react-dropzone";
import { GoCloudUpload } from "react-icons/go";
import classNames from "classnames";
import { useI18n } from "../../hook/useI18n";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return "0B";
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

interface UploadFileProps {
  setFile: (file: File) => void;
}

export const UploadFile: React.FC<UploadFileProps> = (props) => {
  const { setFile } = props;
  const [currentFile, setCurrentFile] = React.useState<File | undefined>();
  const [dragActive, setDragActive] = React.useState(false);
  const { i18n, formatMessage } = useI18n();
  const serverConfig = useSelector((state: TermItState) => state.configuration);
  const onFileSelected = (files: File[]) => {
    const file = files[0];
    setDragActive(false);
    setCurrentFile(file);
    if (file) {
      setFile(file);
    }
  };

  const containerClasses = classNames("create-resource-dropzone", {
    active: dragActive,
  });

  return (
    <Row>
      <Col xs={12}>
        <FormGroup>
          <Dropzone
            onDrop={onFileSelected}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            multiple={false}
          >
            {({ getRootProps, getInputProps }) => (
              <>
                <div {...getRootProps()} className={containerClasses}>
                  <input {...getInputProps()} />
                  <div>
                    <Label className="placeholder-text w-100 text-center">
                      {i18n("resource.create.file.select.label")}
                    </Label>
                  </div>
                  <div className="w-100 icon-container text-center">
                    <GoCloudUpload />
                  </div>
                  {currentFile && (
                    <div className="w-100 text-center">
                      <Label>
                        {currentFile.name +
                          " - " +
                          formatBytes(currentFile.size)}
                      </Label>
                    </div>
                  )}
                </div>
                <FormText>
                  {formatMessage("file.upload.hint", {
                    maxUploadFileSize: serverConfig.maxFileUploadSize,
                  })}
                </FormText>
              </>
            )}
          </Dropzone>
        </FormGroup>
      </Col>
    </Row>
  );
};
export default UploadFile;
