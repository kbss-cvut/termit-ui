import * as React from "react";
import {injectIntl} from "react-intl";
import Resource from "../../model/Resource";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import {Button, ButtonGroup, Card, CardBody, Col, Label, Row} from "reactstrap";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {createResource} from "../../action/AsyncActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import CreateResourceMetadata from "./CreateResourceMetadata";
import CreateFileMetadata from "./file/CreateFileMetadataFull";
import IdentifierResolver from "../../util/IdentifierResolver";
import HeaderWithActions from "../misc/HeaderWithActions";

interface CreateResourceProps extends HasI18n {
    onCreate: (resource: Resource) => Promise<string>;
}

interface CreateResourceState {
    type: string
}

export class CreateResource extends React.Component<CreateResourceProps, CreateResourceState> {

    constructor(props: CreateResourceProps) {
        super(props);
        this.state = {
            type: VocabularyUtils.RESOURCE
        };
    }

    private onTypeSelect = (type: string) => {
        this.setState({type});
    };

    public onCreate = (resource: Resource): Promise<string> => {
        resource.addType(this.state.type);
        return this.props.onCreate(resource).then(iri => {
            if (iri) {
                Routing.transitionTo(Routes.resourceSummary, IdentifierResolver.routingOptionsFromLocation(iri));
            }
            return iri;
        });
    };

    public static onCancel(): void {
        Routing.transitionTo(Routes.resources);
    }

    public render() {
        const i18n = this.props.i18n;
        return <>
            <HeaderWithActions title={i18n("resource.create.title")}/>
            <Card id="create-resource">
                <CardBody>
                    <Row>
                        <Col xs={12}>
                            <Row>
                                <Col>
                                    <Label className="attribute-label">{i18n("resource.create.type")}</Label>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <ButtonGroup className="d-flex form-group">
                                        <Button id="create-resource-type-resource" color="primary" size="sm"
                                                className="w-100 create-resource-type-select" outline={true}
                                                onClick={this.onTypeSelect.bind(null, VocabularyUtils.RESOURCE)}
                                                active={this.state.type === VocabularyUtils.RESOURCE}>{i18n("type.resource")}</Button>
                                        <Button id="create-resource-type-document" color="primary" size="sm"
                                                className="w-100 create-resource-type-select" outline={true}
                                                onClick={this.onTypeSelect.bind(null, VocabularyUtils.DOCUMENT)}
                                                active={this.state.type === VocabularyUtils.DOCUMENT}>{i18n("type.document")}</Button>
                                        <Button id="create-resource-type-file" color="primary" size="sm"
                                                className="w-100 create-resource-type-select" outline={true}
                                                onClick={this.onTypeSelect.bind(null, VocabularyUtils.FILE)}
                                                active={this.state.type === VocabularyUtils.FILE}>{i18n("type.file")}</Button>
                                    </ButtonGroup>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {this.renderMetadataForm()}
                </CardBody>
            </Card></>;
    }

    private renderMetadataForm() {
        if (this.state.type === VocabularyUtils.FILE) {
            return <CreateFileMetadata onCreate={this.onCreate} onCancel={CreateResource.onCancel}/>;
        } else {
            return <CreateResourceMetadata onCreate={this.onCreate} onCancel={CreateResource.onCancel}/>;
        }
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        onCreate: (resource: Resource) => dispatch(createResource(resource))
    };
})(injectIntl(withI18n(CreateResource)));
