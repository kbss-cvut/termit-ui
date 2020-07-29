import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {loadResource, removeResource, updateResource} from "../../action/AsyncActions";
import {Button} from "reactstrap";
import {default as VocabularyUtils, IRI} from "../../util/VocabularyUtils";
import {GoPencil} from "react-icons/go";
import {ThunkDispatch} from "../../util/Types";
import EditableComponent, {EditableComponentState} from "../misc/EditableComponent";
import Resource from "../../model/Resource";
import ResourceMetadata from "./ResourceMetadata";
import ResourceEdit from "./ResourceEdit";
import "./Resources.scss";
import RemoveAssetDialog from "../asset/RemoveAssetDialog";
import Utils from "../../util/Utils";
import FileEdit from "./file/FileEdit";
import HeaderWithActions from "../misc/HeaderWithActions";
import {FaTrashAlt} from "react-icons/fa";
import CopyIriIcon from "../misc/CopyIriIcon";

function isFile(resource: Resource) {
    return Utils.getPrimaryAssetType(resource) === VocabularyUtils.FILE;
}

export interface ResourceSummaryProps extends HasI18n {
    resource: Resource;
    loadResource: (iri: IRI) => Promise<any>;
    saveResource: (resource: Resource) => Promise<any>;
    removeResource: (resource: Resource) => Promise<any>;
}

export interface ResourceSummaryState extends EditableComponentState {
    showRemoveDialog: boolean;
}

export class ResourceSummary<P extends ResourceSummaryProps = ResourceSummaryProps, S extends ResourceSummaryState = ResourceSummaryState>
    extends EditableComponent<P, S> {

    constructor(props: P) {
        super(props);
        this.state = {
            edit: false,
            showRemoveDialog: false
        } as S;
    }

    public onSave = (resource: Resource): Promise<void> => {
        return this.props.saveResource(resource).then(() => {
            this.onCloseEdit();
            return this.props.loadResource(VocabularyUtils.create(this.props.resource.iri));
        });
    };

    protected onRemoveClick = () => {
        this.setState({showRemoveDialog: true});
    };

    public onRemove = () => {
        this.props.removeResource(this.props.resource);
        this.setState({showRemoveDialog: false});
    };

    protected onRemoveCancel = () => {
        this.setState({showRemoveDialog: false});
    };

    protected canRemove() {
        return true;
    }

    public render() {
        return <div id="resource-detail">
            <HeaderWithActions title={
                <>{this.props.resource.label}<CopyIriIcon url={this.props.resource.iri as string}/></>
            } actions={this.getActionButtons()}/>

            <RemoveAssetDialog show={this.state.showRemoveDialog} asset={this.props.resource}
                               onCancel={this.onRemoveCancel} onSubmit={this.onRemove}/>
            {this.state.edit ? this.renderMetadataEdit() : this.renderMetadata()}
        </div>;
    }

    protected getActionButtons() {
        const i18n = this.props.i18n;
        const buttons = [];
        if (!this.state.edit) {
            buttons.push(<Button id="resource-detail-edit" key="resource.summary.edit" size="sm" color="primary"
                                 title={i18n("edit")}
                                 onClick={this.onEdit}><GoPencil/>&nbsp;{i18n("edit")}</Button>);
        }
        if (this.canRemove()) {
            buttons.push(<Button id="resource-detail-remove" key="resource.summary.remove" size="sm" color="outline-danger"
                                 title={i18n("asset.remove.tooltip")}
                                 onClick={this.onRemoveClick}><FaTrashAlt/>&nbsp;{i18n("remove")}</Button>);
        }
        return buttons;
    }

    protected renderMetadataEdit() {
        if (isFile(this.props.resource)) {
            return <FileEdit resource={this.props.resource} save={this.onSave} cancel={this.onCloseEdit}/>;
        } else  {
            return <ResourceEdit resource={this.props.resource} save={this.onSave} cancel={this.onCloseEdit}/>;
        }
    }

    protected renderMetadata() {
        return <div className="metadata-panel">
            <ResourceMetadata resource={this.props.resource}/>
        </div>;
    }
}

export default connect((state: TermItState) => {
    return {
        intl: state.intl
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadResource: (iri: IRI) => dispatch(loadResource(iri)),
        saveResource: (resource: Resource) => dispatch(updateResource(resource)),
        removeResource: (resource: Resource) => dispatch(removeResource(resource))
    };
})(injectIntl(withI18n(ResourceSummary)));
