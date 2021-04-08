import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n from "../../hoc/withI18n";
import {Card, CardBody, Form} from "reactstrap";
import Resource from "../../../model/Resource";
import {ResourceEdit, ResourceEditProps, ResourceEditState} from "../ResourceEdit";
import {connect} from "react-redux";
import {uploadFileContent} from "../../../action/AsyncActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {ThunkDispatch} from "../../../util/Types";
import UploadFile from "./UploadFile";
import AppNotification from "../../../model/AppNotification";
import {publishNotification} from "../../../action/SyncActions";
import NotificationType from "../../../model/NotificationType";

interface FileEditProps extends ResourceEditProps {
    resource: Resource;
    cancel: () => void;
    uploadFileContent: (fileIri: string, file: File) => Promise<any>;
    publishNotification: (notification: AppNotification) => void;
}

interface FileEditState extends ResourceEditState {
    file?: File;
    dragActive: boolean;
}

export class FileEdit extends ResourceEdit<FileEditProps, FileEditState> {
    constructor(props: FileEditProps) {
        super(props);
        this.state = {
            ...this.state,
            file: undefined,
            dragActive: false
        };
    }

    public onSave = () => {
        const r = this.getCurrentResource();
        this.props.save(r).then(() => {
            if (this.state.file) {
                this.props.uploadFileContent(this.props.resource.iri, this.state.file).then(() =>
                    this.props.publishNotification({
                        source: {type: NotificationType.FILE_CONTENT_UPLOADED}
                    })
                );
            }
        });
    };

    private setFile(file: File): void {
        this.setState({file, dragActive: false});
    }

    public render() {
        const setFile = this.setFile.bind(this);
        return (
            <Card>
                <CardBody>
                    <Form>
                        <UploadFile resource={this.props.resource} setFile={setFile} />
                        {this.renderBasicMetadataInputs()}
                        {this.renderSubmitButtons()}
                    </Form>
                </CardBody>
            </Card>
        );
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        uploadFileContent: (fileIri: string, file: File) =>
            dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
        publishNotification: (notification: AppNotification) => dispatch(publishNotification(notification))
    };
})(injectIntl(withI18n(FileEdit)));
