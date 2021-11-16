import * as React from "react";
import { injectIntl } from "react-intl";
import Resource from "../../model/Resource";
import withI18n, { HasI18n } from "../hoc/withI18n";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Col,
  Label,
  Row,
} from "reactstrap";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  createFileInDocument,
  createResource,
  uploadFileContent,
} from "../../action/AsyncActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import CreateResourceMetadata from "./CreateResourceMetadata";
import TermItFile from "../../model/File";
import AppNotification from "../../model/AppNotification";
import { publishNotification } from "../../action/SyncActions";
import Files from "./document/Files";
import Utils from "../../util/Utils";
import NotificationType from "../../model/NotificationType";
import AddFile from "./document/AddFile";
import RemoveFile from "./document/RemoveFile";

interface CreateResourceFormProps extends HasI18n {
  createResource: (resource: Resource) => Promise<string | undefined>;
  createFile: (file: TermItFile, documentIri: string) => Promise<any>;
  uploadFileContent: (fileIri: string, file: File) => Promise<any>;
  publishNotification: (notification: AppNotification) => void;
  onCancel: () => void;
  onSuccess: (iri: string) => void;
  justDocument: boolean;
}

interface CreateResourceFormState {
  type: string;
  files: TermItFile[];
  fileContents: File[];
  showCreateFile: boolean;
}

export class CreateResourceForm extends React.Component<
  CreateResourceFormProps,
  CreateResourceFormState
> {
  constructor(props: CreateResourceFormProps) {
    super(props);
    this.state = {
      type: VocabularyUtils.DOCUMENT,
      files: [],
      fileContents: [],
      showCreateFile: false,
    };
  }

  private onTypeSelect = (type: string) => {
    this.setState({ type });
  };

  public onCreate = (resource: Resource): Promise<string | undefined> => {
    resource.addType(this.state.type);
    const files = this.state.files;
    const fileContents = this.state.fileContents;
    const onSuccess = this.props.onSuccess;
    return this.props.createResource(resource).then((iri) => {
      return Promise.all(
        Utils.sanitizeArray(files).map((f, fIndex) =>
          this.props.createFile(f, resource.iri).then(() =>
            this.props.uploadFileContent(f.iri, fileContents[fIndex]).then(() =>
              this.props.publishNotification({
                source: { type: NotificationType.FILE_CONTENT_UPLOADED },
              })
            )
          )
        )
      )
        .then(() => onSuccess(resource.iri))
        .then(() => iri);
    });
  };

  private onCreateFile = (termitFile: Resource, file: File): Promise<void> => {
    return Promise.resolve().then(() => {
      const files = this.state.files.concat(termitFile as TermItFile);
      const fileContents = this.state.fileContents.concat(file);
      this.setState({ files, fileContents });
    });
  };

  private onRemoveFile = (termitFile: Resource): Promise<void> => {
    return Promise.resolve().then(() => {
      const index = this.state.files.indexOf(termitFile as TermItFile);
      if (index > -1) {
        const files = this.state.files;
        files.splice(index, 1);
        const fileContents = this.state.fileContents;
        fileContents.splice(index, 1);
        this.setState({ files, fileContents });
      }
    });
  };

  public render() {
    const i18n = this.props.i18n;
    return (
      <>
        <Card id="create-resource">
          <CardBody>
            {this.props.justDocument ? undefined : (
              <Row>
                <Col xs={12}>
                  <Row>
                    <Col>
                      <Label className="attribute-label">
                        {i18n("resource.create.type")}
                      </Label>
                    </Col>
                  </Row>
                  <Row>
                    <Col>
                      <ButtonGroup className="d-flex form-group">
                        <Button
                          id="create-resource-type-resource"
                          color="primary"
                          size="sm"
                          className="w-100 create-resource-type-select"
                          outline={true}
                          onClick={this.onTypeSelect.bind(
                            null,
                            VocabularyUtils.RESOURCE
                          )}
                          active={this.state.type === VocabularyUtils.RESOURCE}
                        >
                          {i18n("type.resource")}
                        </Button>
                        <Button
                          id="create-resource-type-document"
                          color="primary"
                          size="sm"
                          className="w-100 create-resource-type-select"
                          outline={true}
                          onClick={this.onTypeSelect.bind(
                            null,
                            VocabularyUtils.DOCUMENT
                          )}
                          active={this.state.type === VocabularyUtils.DOCUMENT}
                        >
                          {i18n("type.document")}
                        </Button>
                      </ButtonGroup>
                    </Col>
                  </Row>
                </Col>
              </Row>
            )}
            <CreateResourceMetadata
              onCreate={this.onCreate}
              onCancel={this.props.onCancel}
            >
              {this.state.type === VocabularyUtils.DOCUMENT ? (
                <Files
                  files={this.state.files}
                  actions={[
                    <AddFile
                      key="add-file"
                      performAction={this.onCreateFile}
                    />,
                  ]}
                  itemActions={(file: TermItFile) => [
                    <RemoveFile
                      key="remove-file"
                      file={file}
                      performAction={this.onRemoveFile.bind(this, file)}
                      withConfirmation={false}
                    />,
                  ]}
                />
              ) : null}
            </CreateResourceMetadata>
          </CardBody>
        </Card>
      </>
    );
  }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    createResource: (resource: Resource) => dispatch(createResource(resource)),
    createFile: (file: TermItFile, documentIri: string) =>
      dispatch(createFileInDocument(file, VocabularyUtils.create(documentIri))),
    uploadFileContent: (fileIri: string, file: File) =>
      dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
    publishNotification: (notification: AppNotification) =>
      dispatch(publishNotification(notification)),
  };
})(injectIntl(withI18n(CreateResourceForm)));
