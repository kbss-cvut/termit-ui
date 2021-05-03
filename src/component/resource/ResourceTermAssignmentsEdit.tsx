import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { FormGroup, Label } from "reactstrap";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import Term, { TermData } from "../../model/Term";
import { connect } from "react-redux";
import { ThunkDispatch, TreeSelectFetchOptionsParams } from "../../util/Types";
import FetchOptionsFunction from "../../model/Functions";
import { loadAllTerms } from "../../action/AsyncActions";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
} from "../term/TermTreeSelectHelper";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";

function normalizeTerms(terms: Term[]) {
  terms
    .filter((t) => t.plainSubTerms)
    .forEach((t) => (t.plainSubTerms = t.subTerms!.map((st) => st.iri)));
  return terms;
}

interface PropsExternal {
  terms: Term[];
  onChange: (subTerms: Term[]) => void;
}

interface PropsConnected {}

interface DispatchConnected {
  loadTerms: (
    fetchOptions: FetchOptionsFunction,
    namespace: string
  ) => Promise<Term[]>;
}

interface ResourceTermAssignmentsEditProps
  extends PropsExternal,
    PropsConnected,
    DispatchConnected,
    HasI18n {}

export class ResourceTermAssignmentsEdit extends React.Component<
  ResourceTermAssignmentsEditProps,
  {}
> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: ResourceTermAssignmentsEditProps) {
    super(props);
    this.treeComponent = React.createRef();
  }

  public componentDidUpdate(
    prevProps: Readonly<ResourceTermAssignmentsEditProps>
  ) {
    if (prevProps.locale !== this.props.locale) {
      this.treeComponent.current.forceUpdate();
    }
  }

  private onChange = (val: Term[]) => {
    this.props.onChange(val);
  };

  public fetchOptions = (
    fetchOptions: TreeSelectFetchOptionsParams<TermData>
  ) => {
    const selected = Utils.sanitizeArray(this.props.terms).map((p) => p.iri!);
    return this.props
      .loadTerms(
        {
          ...fetchOptions,
          includeTerms: selected,
        },
        VocabularyUtils.create(
          fetchOptions.option ? fetchOptions.option.iri! : ""
        ).namespace!
      )
      .then((terms) => {
        return normalizeTerms(
          processTermsForTreeSelect(terms, undefined, {
            searchString: fetchOptions.searchString,
          })
        );
      });
  };

  private resolveSelected() {
    return Utils.sanitizeArray(this.props.terms)
      .filter((p) => p.vocabulary !== undefined)
      .map((p) => p.iri);
  }

  public render() {
    const treeProps = commonTermTreeSelectProps(this.props);
    treeProps.noResultsText = "";
    treeProps.placeholder = this.props.i18n(
      "resource.metadata.terms.edit.select.placeholder"
    );
    return (
      <FormGroup>
        <Label className="attribute-label">
          {this.props.i18n("resource.metadata.terms.assigned")}
        </Label>{" "}
        <IntelligentTreeSelect
          ref={this.treeComponent}
          id="edit-resource-tags"
          className="resource-tags-edit"
          onChange={this.onChange}
          value={this.resolveSelected()}
          fetchOptions={this.fetchOptions}
          fetchLimit={300}
          maxHeight={150}
          multi={true}
          displayInfoOnHover={true}
          {...treeProps}
        />
      </FormGroup>
    );
  }
}

export default connect<PropsConnected, DispatchConnected>(
  undefined,
  (dispatch: ThunkDispatch) => {
    return {
      loadTerms: (fetchOptions: FetchOptionsFunction, namespace: string) =>
        dispatch(loadAllTerms(fetchOptions, namespace)),
    };
  }
)(injectIntl(withI18n(ResourceTermAssignmentsEdit)));
