import React from "react";
import TermItFile from "../../../model/File";
import { useI18n } from "../../hook/useI18n";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledButtonDropdown,
} from "reactstrap";
import { GoFile } from "react-icons/go";
import FileContentLink from "../file/FileContentLink";

interface FileContentActionsProps {
  file: TermItFile;

  onDownload: (file: TermItFile) => void;
  onDownloadOriginal: (file: TermItFile) => void;
}

const FileContentActions: React.FC<FileContentActionsProps> = ({
  file,
  onDownload,
  onDownloadOriginal,
}) => {
  const { i18n } = useI18n();
  return (
    <UncontrolledButtonDropdown>
      <DropdownToggle
        size="sm"
        caret={true}
        color="primary"
        style={{ borderRadius: "0.2rem", marginRight: "4px" }}
      >
        <GoFile className="mr-1" />
        {i18n("resource.metadata.file.content")}
      </DropdownToggle>
      <DropdownMenu>
        <FileContentLink
          key="view-content"
          file={file}
          wrapperComponent={DropdownItem}
        />
        <DropdownItem
          key="download"
          onClick={() => onDownload(file)}
          title={i18n("resource.metadata.file.content.download.tooltip")}
        >
          {i18n("resource.metadata.file.content.download")}
        </DropdownItem>
        <DropdownItem
          key="download-original"
          onClick={() => onDownloadOriginal(file)}
          title={i18n(
            "resource.metadata.file.content.download.original.tooltip"
          )}
        >
          {i18n("resource.metadata.file.content.download.original")}
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledButtonDropdown>
  );
};

export default FileContentActions;
