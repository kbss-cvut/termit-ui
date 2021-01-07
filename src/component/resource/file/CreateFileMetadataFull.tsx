import * as React from "react";
import {injectIntl} from "react-intl";
import {
    CreateResourceMetadataProps,
} from "../CreateResourceMetadata";
import VocabularyUtils from "../../../util/VocabularyUtils";
import withI18n from "../../hoc/withI18n";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {uploadFileContent} from "../../../action/AsyncActions";
import AppNotification from "../../../model/AppNotification";
import {publishNotification} from "../../../action/SyncActions";
import NotificationType from "../../../model/NotificationType";
import CreateFileMetadata from "./CreateFileMetadata";
import Resource from "../../../model/Resource";

interface CreateFileMetadataFullProps extends CreateResourceMetadataProps {
    uploadFileContent: (fileIri: string, file: File) => Promise<any>;
    publishNotification: (notification: AppNotification) => void;
}

export class CreateFileMetadataFull extends React.Component<CreateFileMetadataFullProps> {

    public onCreate = (resource: Resource, file?: File) => {
        return this.props.onCreate(resource)
            .then(() => {
                if (file) {
                    this.props.uploadFileContent(resource.iri, file)
                }
            }).then(() => this.props.publishNotification({
                    source: {type: NotificationType.FILE_CONTENT_UPLOADED}
                })
            );
    };

    public render() {
        return <CreateFileMetadata onCreate={this.onCreate}
                                   onCancel={this.props.onCancel}/>
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        uploadFileContent: (fileIri: string, file: File) => dispatch(uploadFileContent(VocabularyUtils.create(fileIri), file)),
        publishNotification: (notification: AppNotification) => dispatch(publishNotification(notification))
    };
})(injectIntl(withI18n(CreateFileMetadataFull)));
