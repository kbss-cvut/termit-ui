import * as React from "react";
import {injectIntl} from "react-intl";
import {
    CreateResourceMetadata,
    CreateResourceMetadataProps,
    CreateResourceMetadataState
} from "../CreateResourceMetadata";
import VocabularyUtils from "../../../util/VocabularyUtils";
import withI18n from "../../hoc/withI18n";
import {Form} from "reactstrap";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {uploadFileContent} from "../../../action/AsyncActions";
import AppNotification from "../../../model/AppNotification";
import {publishNotification} from "../../../action/SyncActions";
import NotificationType from "../../../model/NotificationType";
import UploadFile from "./UploadFile";
import TermItFile from "../../../model/File";

interface CreateFileMetadataProps extends CreateResourceMetadataProps {
    uploadFileContent: (fileIri: string, file: File) => Promise<any>;
    publishNotification: (notification: AppNotification) => void;
}

interface CreateFileMetadataState extends CreateResourceMetadataState {
    file?: File;
    dragActive: boolean;
}

export class CreateFileMetadata extends CreateResourceMetadata<CreateFileMetadataProps, CreateFileMetadataState> {

    constructor(props: CreateFileMetadataProps) {
        super(props);
        this.state = {
            iri: "",
            label: "",
            description: "",
            types: VocabularyUtils.RESOURCE,
            generateIri: true,
            file: undefined,
            dragActive: false
        }
    }

    public onCreate = () => {
        const {generateIri, file, dragActive, ...data} = this.state;
        this.props.onCreate(new TermItFile(data)).then(() => {
            if (this.state.file) {
                this.props.uploadFileContent(this.state.iri, this.state.file).then(() => this.props.publishNotification({source: {type: NotificationType.FILE_CONTENT_UPLOADED}}));
            }
        });
    };

    public setFile(file: File): void {
        this.setState({file, label: file.name, dragActive: false});
        this.generateIri(file.name);
    }

    public render() {
        const setFile = this.setFile.bind(this);
        return <Form>
            <UploadFile setFile={setFile}/>
            {this.renderBasicMetadataInputs()}
            {this.renderSubmitButtons()}
        </Form>;
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        uploadFileContent: (fileIri: string, file: File) => dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
        publishNotification: (notification: AppNotification) => dispatch(publishNotification(notification))
    };
})(injectIntl(withI18n(CreateFileMetadata)));
