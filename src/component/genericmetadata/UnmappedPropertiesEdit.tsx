import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { Button, Col, FormGroup, Label, Row } from "reactstrap";
import { GoPlus } from "react-icons/go";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import OutgoingLink from "../misc/OutgoingLink";
import AssetLabel from "../misc/AssetLabel";
import CustomInput from "../misc/CustomInput";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { ThunkDispatch } from "../../util/Types";
import { createProperty, getProperties } from "../../action/AsyncActions";
import RdfsResource, { RdfsResourceData } from "../../model/RdfsResource";
import CreatePropertyForm from "./CreatePropertyForm";
import { clearProperties } from "../../action/SyncActions";
import { FaTrashAlt } from "react-icons/fa";
import Utils from "../../util/Utils";
import AttributeSectionContainer from "../layout/AttributeSectionContainer";
import BadgeButton from "../misc/BadgeButton";
import "./UnmappedProperties.scss";

interface UnmappedPropertiesEditProps extends HasI18n {
  properties: Map<string, string[]>;
  ignoredProperties?: string[]; // Properties which should not be offered in the editor
  onChange: (properties: Map<string, string[]>) => void;
  loadKnownProperties: () => void;
  knownProperties: RdfsResource[];
  createProperty: (property: RdfsResource) => Promise<any>;
  clearProperties: () => void;
}

interface UnmappedPropertiesEditState {
  property: RdfsResource | null;
  value: string;
  showCreatePropertyForm: boolean;
}

export class UnmappedPropertiesEdit extends React.Component<
  UnmappedPropertiesEditProps,
  UnmappedPropertiesEditState
> {
  constructor(props: UnmappedPropertiesEditProps) {
    super(props);
    this.state = {
      property: null,
      value: "",
      showCreatePropertyForm: false,
    };
  }

  public componentDidMount() {
    this.props.loadKnownProperties();
  }

  private onRemove = (property: string, value: string) => {
    const newProperties = new Map(this.props.properties);
    const propValues = newProperties.get(property)!;
    if (propValues.length === 1) {
      newProperties.delete(property);
    } else {
      propValues.splice(propValues.indexOf(value), 1);
    }
    this.props.onChange(newProperties);
  };

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const change = {};
    change[e.currentTarget.name] = e.currentTarget.value;
    this.setState(change);
  };

  private onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && this.isValid()) {
      this.onAdd();
    }
  };

  public onPropertySelect = (property: RdfsResource | null) => {
    this.setState({ property });
  };

  private onAdd = () => {
    const newProperties = new Map(this.props.properties);
    if (newProperties.has(this.state.property!.iri)) {
      newProperties.get(this.state.property!.iri)!.push(this.state.value);
    } else {
      newProperties.set(this.state.property!.iri, [this.state.value]);
    }
    this.props.onChange(newProperties);
    this.setState({ property: null, value: "" });
  };

  private isValid() {
    return this.state.property && this.state.value.length > 0;
  }

  public onCreateProperty = (propertyData: RdfsResourceData) => {
    const property = new RdfsResource(propertyData);
    this.setState({ property });
    this.props.createProperty(property).then(() => {
      this.props.clearProperties();
      this.props.loadKnownProperties();
    });
  };

  public render() {
    const i18n = this.props.i18n;
    return (
      <AttributeSectionContainer label={i18n("properties.edit.title")}>
        <table className="mb-3">
          <tbody>{this.renderExisting()}</tbody>
        </table>
        <Row>
          <Col xl={6} md={12}>
            {this.renderPropertyInput()}
          </Col>
          <Col xl={5} md={11} className="align-self-end">
            <CustomInput
              name="value"
              label={i18n("properties.edit.value")}
              value={this.state.value}
              onChange={this.onChange}
              onKeyPress={this.onKeyPress}
            />
          </Col>
          <Col md={1} className="form-group align-self-end">
            <Button
              color="primary"
              size="sm"
              title={i18n("properties.edit.add.title")}
              onClick={this.onAdd}
              disabled={!this.isValid()}
            >
              <GoPlus /> {i18n("properties.edit.add.text")}
            </Button>
          </Col>
        </Row>
      </AttributeSectionContainer>
    );
  }

  private renderExisting() {
    const result: JSX.Element[] = [];
    this.props.properties.forEach((values, k) => {
      result.push(
        <tr key={k}>
          <td className="align-bottom">
            <OutgoingLink
              label={
                <Label className="property-label mb-0 mt-2">
                  <AssetLabel iri={k} />
                </Label>
              }
              iri={k}
            />
          </td>
        </tr>
      );
      const sortedItems = [...values];
      sortedItems.sort(Utils.localeComparator);
      sortedItems.forEach((v) =>
        result.push(
          <tr key={`${k}-${Utils.hashCode(v)}`}>
            <td className="align-middle">
              <ul>
                <li>{v}</li>
              </ul>
            </td>
            <td className="align-middle">
              <BadgeButton
                color="danger"
                outline={true}
                title={this.props.i18n("properties.edit.remove")}
                className="ml-3"
                onClick={this.onRemove.bind(null, k, v)}
              >
                <FaTrashAlt />
                {this.props.i18n("properties.edit.remove.text")}
              </BadgeButton>
            </td>
          </tr>
        )
      );
    });
    return result;
  }

  private renderPropertyInput() {
    const i18n = this.props.i18n;
    return (
      <>
        {this.state.showCreatePropertyForm && (
          <CreatePropertyForm
            onOptionCreate={this.onCreateProperty}
            toggleModal={() => this.setState({ showCreatePropertyForm: false })}
          />
        )}
        <FormGroup>
          <div className="d-flex justify-content-between">
            <Label className="attribute-label">
              {i18n("properties.edit.property")}
            </Label>
            <Button
              color="primary"
              size="sm"
              className="align-self-end create-property-button"
              title={i18n("properties.edit.new")}
              onClick={() => this.setState({ showCreatePropertyForm: true })}
            >
              {i18n("properties.edit.new")}
            </Button>
          </div>
          {this.props.knownProperties.length > 0 ? (
            <IntelligentTreeSelect
              className="term-edit"
              value={this.state.property}
              onChange={this.onPropertySelect}
              childrenKey="children"
              valueKey="iri"
              labelKey="label"
              showSettings={true}
              maxHeight={150}
              multi={false}
              renderAsTree={false}
              simpleTreeData={true}
              options={this.prepareKnownPropertiesForRendering()}
              placeholder=""
              classNamePrefix="react-select"
              noResultsText={i18n("main.search.no-results")}
            />
          ) : (
            <CustomInput disabled={true} />
          )}
        </FormGroup>
      </>
    );
  }

  private prepareKnownPropertiesForRendering() {
    const options = this.props.knownProperties.map((p) =>
      p.label ? p : Object.assign(p, { label: p.iri })
    );
    if (!this.props.ignoredProperties) {
      return options;
    }
    return options.filter(
      (opt) => this.props.ignoredProperties!.indexOf(opt.iri) === -1
    );
  }
}

export default connect(
  (state: TermItState) => {
    return {
      knownProperties: state.properties,
      intl: state.intl, // Pass intl in props to force UI re-render on language switch
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadKnownProperties: () => dispatch(getProperties()),
      createProperty: (property: RdfsResource) =>
        dispatch(createProperty(property)),
      clearProperties: () => dispatch(clearProperties()),
    };
  }
)(injectIntl(withI18n(UnmappedPropertiesEdit)));
