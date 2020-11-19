import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n from "../../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../../model/TermItState";
import {
    exportFileContent,
    hasFileContent,
    loadResource,
    removeResource,
    updateResource
} from "../../../action/AsyncActions";
import {Button} from "reactstrap";
import {default as VocabularyUtils, IRI} from "../../../util/VocabularyUtils";
import {ThunkDispatch} from "../../../util/Types";
import "../Resources.scss";
import {consumeNotification} from "../../../action/SyncActions";
import RemoveAssetDialog from "../../asset/RemoveAssetDialog";
import File from "../../../model/File";
import AppNotification from "../../../model/AppNotification";
import NotificationType from "../../../model/NotificationType";
import {ResourceSummary, ResourceSummaryProps, ResourceSummaryState} from "../ResourceSummary";
import TextAnalysisInvocationButton from "./TextAnalysisInvocationButton";
import HeaderWithActions from "../../misc/HeaderWithActions";
import CopyIriIcon from "../../misc/CopyIriIcon";
import FileContentLink from "./FileContentLink";
import {GoCloudDownload} from "react-icons/go";
import Resource from "../../../model/Resource";

interface FileSummaryProps extends ResourceSummaryProps {
    resource: File;
    notifications: AppNotification[];
    consumeNotification: (notification: AppNotification) => void;

    hasContent: (iri: IRI) => Promise<boolean>;
    downloadContent: (iri: IRI) => void;
}

interface FileSummaryState extends ResourceSummaryState {
    hasContent: boolean;
}

export class FileSummary extends ResourceSummary<FileSummaryProps, FileSummaryState> {

    constructor(props: FileSummaryProps) {
        super(props);
        this.state = {
            edit: false,
            showRemoveDialog: false,
            hasContent: false
        };
    }

    public componentDidMount(): void {
        this.checkForContent(VocabularyUtils.create(this.props.resource.iri));
    }

    public componentDidUpdate(prevProps: FileSummaryProps): void {
        const resourceIri = VocabularyUtils.create(this.props.resource.iri);
        if (this.props.resource.iri !== prevProps.resource.iri) {
            this.checkForContent(resourceIri);
        }
        const fileUploadNotification = this.props.notifications.find(n => n.source.type === NotificationType.FILE_CONTENT_UPLOADED);
        if (fileUploadNotification) {
            this.checkForContent(resourceIri);
            this.props.consumeNotification(fileUploadNotification);
        }
    }

    private checkForContent(iri: IRI) {
        this.props.hasContent(iri).then((res: boolean) => this.setState({hasContent: res}));
    }

    public onDownloadContent = () => {
        const iri = VocabularyUtils.create(this.props.resource.iri);
        this.props.downloadContent(iri);
    };

    public render() {
        let buttons = this.createContentRelatedButtons();
        buttons = buttons.concat(this.getActionButtons());

        return <div id="resource-detail">
            <HeaderWithActions title={
                <>{this.props.resource.label}<CopyIriIcon url={this.props.resource.iri as string}/></>
            } actions={buttons}/>

            <RemoveAssetDialog show={this.state.showRemoveDialog} asset={this.props.resource}
                               onCancel={this.onCloseRemove} onSubmit={this.onRemove}/>
            {this.state.edit ? this.renderMetadataEdit() : this.renderMetadata()}
        </div>;
    }

    private createContentRelatedButtons() {
        if (this.state.hasContent) {
            const i18n = this.props.i18n;
            return [
                <FileContentLink id="resource-detail-content-view"
                                 key="resource-detail-content-view"
                                 file={this.props.resource}/>,
                <Button color="primary" size="sm" id="resource-detail-content-download"
                        key="resource-detail-content-download"
                        title={i18n("resource.metadata.file.content.download")}
                        onClick={this.onDownloadContent}>
                    <GoCloudDownload/>&nbsp;{i18n("resource.metadata.file.content.download")}
                </Button>,
                <TextAnalysisInvocationButton id="resource-file-analyze"
                                              key="resource-file-analyze"
                                              className="ml-1"
                                              fileIri={VocabularyUtils.create(this.props.resource.iri)}/>
            ];
        }
        return [];
    }
}

export default connect((state: TermItState) => {
    return {
        notifications: state.notifications
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadResource: (iri: IRI) => dispatch(loadResource(iri)),
        saveResource: (resource: Resource) => dispatch(updateResource(resource)),
        removeResource: (resource: Resource) => dispatch(removeResource(resource)),
        consumeNotification: (notification: AppNotification) => dispatch(consumeNotification(notification)),
        hasContent: (iri: IRI) => dispatch(hasFileContent(iri)),
        downloadContent: (iri: IRI) => dispatch(exportFileContent(iri))
    };
})(injectIntl(withI18n(FileSummary)));
