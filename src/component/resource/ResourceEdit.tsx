import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import {
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Form,
  Row,
} from "reactstrap";
import Resource from "../../model/Resource";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";

export interface ResourceEditProps extends HasI18n {
  resource: Resource;
  save: (resource: Resource) => Promise<void>;
  cancel: () => void;
}

export interface ResourceEditState {
  label: string;
  description?: string;
}

export class ResourceEdit<
  P extends ResourceEditProps = ResourceEditProps,
  S extends ResourceEditState = ResourceEditState
> extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      label: props.resource.label,
      description: props.resource.description,
    } as S;
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const change = {};
    change[e.currentTarget.name.endsWith("label") ? "label" : "description"] =
      e.currentTarget.value;
    this.setState(change);
  };

  protected getCurrentResource() {
    const newResource = this.props.resource.clone();
    newResource.label = this.state.label;
    newResource.description = this.state.description;
    newResource.terms = this.props.resource.terms;
    return newResource;
  }

  public onSave = () => {
    this.props.save(this.getCurrentResource());
  };

  public render() {
    return (
      <Card>
        <CardBody>
          <Form>
            {this.renderBasicMetadataInputs()}
            {this.renderSubmitButtons()}
          </Form>
        </CardBody>
      </Card>
    );
  }

  protected renderBasicMetadataInputs() {
    const i18n = this.props.i18n;
    return (
      <>
        <Row>
          <Col xs={12}>
            <CustomInput
              name="edit-resource-iri"
              label={i18n("asset.iri")}
              value={this.props.resource.iri}
              disabled={true}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <CustomInput
              name="edit-resource-label"
              label={i18n("asset.label")}
              value={this.state.label}
              onChange={this.onChange}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <TextArea
              name="edit-resource-description"
              label={i18n("resource.metadata.description")}
              rows={4}
              value={this.state.description}
              onChange={this.onChange}
            />
          </Col>
        </Row>
      </>
    );
  }

  protected renderSubmitButtons() {
    const i18n = this.props.i18n;
    return (
      <Row>
        <Col xs={12}>
          <ButtonToolbar className="d-flex justify-content-center mt-4">
            <Button
              id="edit-resource-submit"
              onClick={this.onSave}
              color="success"
              size="sm"
            >
              {i18n("save")}
            </Button>
            <Button
              id="edit-resource-cancel"
              onClick={this.props.cancel}
              key="cancel"
              color="outline-dark"
              size="sm"
            >
              {i18n("cancel")}
            </Button>
          </ButtonToolbar>
        </Col>
      </Row>
    );
  }
}

export default injectIntl(withI18n(ResourceEdit));
