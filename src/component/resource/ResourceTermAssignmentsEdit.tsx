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
import { loadTerms } from "../../action/AsyncActions";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
  resolveSelectedIris,
} from "../term/TermTreeSelectHelper";
import BaseRelatedTermSelector, {
  BaseRelatedTermSelectorProps,
  PAGE_SIZE,
  SEARCH_DELAY,
} from "../term/BaseRelatedTermSelector";
import TermItState from "../../model/TermItState";
import { IRI } from "../../util/VocabularyUtils";
import {
  loadTermsFromCanonical,
  loadTermsFromCurrentWorkspace,
} from "../../action/AsyncTermActions";

interface PropsExternal {
  terms: Term[];
  onChange: (subTerms: Term[]) => void;
}

interface ResourceTermAssignmentsEditProps
  extends PropsExternal,
    BaseRelatedTermSelectorProps,
    HasI18n {}

export class ResourceTermAssignmentsEdit extends BaseRelatedTermSelector<ResourceTermAssignmentsEditProps> {
  private readonly treeComponent: React.RefObject<IntelligentTreeSelect>;

  constructor(props: ResourceTermAssignmentsEditProps) {
    super(props);
    this.treeComponent = React.createRef();
    this.state = {
      allVocabularyTerms: true,
      allWorkspaceTerms: false,
      vocabularyTermCount: 0,
      workspaceTermCount: 0,
      lastSearchString: "",
    };
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
    let { allWorkspaceTerms, workspaceTermCount, lastSearchString } =
      this.state;
    let fetchFunction: (
      fetchOptions: TreeSelectFetchOptionsParams<TermData>
    ) => Promise<Term[]>;
    const offset = fetchOptions.offset || 0;
    const fetchOptionsCopy = Object.assign({}, fetchOptions);
    if (
      fetchOptions.searchString?.indexOf(lastSearchString) === -1 ||
      (lastSearchString.length === 0 &&
        (fetchOptions.searchString || "").length > 0)
    ) {
      this.setState({
        allWorkspaceTerms: false,
        workspaceTermCount: 0,
      });
      // Set these to false to ensure the effect right now
      allWorkspaceTerms = false;
      fetchOptionsCopy.offset = 0;
    }
    if (allWorkspaceTerms) {
      fetchOptionsCopy.offset = offset - workspaceTermCount;
      fetchFunction = this.fetchCanonicalTerms;
    } else {
      fetchOptionsCopy.offset = offset;
      fetchFunction = this.fetchWorkspaceTerms;
    }
    this.setState({ lastSearchString: fetchOptions.searchString || "" });
    return fetchFunction(fetchOptionsCopy).then((terms) => {
      return BaseRelatedTermSelector.enhanceWithCurrent(
        processTermsForTreeSelect(terms, undefined, {
          searchString: fetchOptionsCopy.searchString,
        }),
        undefined,
        this.props.terms
      );
    });
  };

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
          value={resolveSelectedIris(this.props.terms)}
          fetchOptions={this.fetchOptions}
          fetchLimit={PAGE_SIZE}
          searchDelay={SEARCH_DELAY}
          maxHeight={150}
          multi={true}
          displayInfoOnHover={true}
          {...treeProps}
        />
      </FormGroup>
    );
  }
}

export default connect(
  (state: TermItState) => ({ workspace: state.workspace! }),
  (dispatch: ThunkDispatch) => {
    return {
      // Won't be used anyway, but is required by the props
      loadTermsFromVocabulary: (
        fetchOptions: FetchOptionsFunction,
        vocabularyIri: IRI
      ) => dispatch(loadTerms(fetchOptions, vocabularyIri)),
      loadTermsFromCurrentWorkspace: (
        fetchOptions: FetchOptionsFunction,
        excludeVocabulary: string
      ) =>
        dispatch(
          loadTermsFromCurrentWorkspace(fetchOptions, excludeVocabulary)
        ),
      loadTermsFromCanonical: (fetchOptions: FetchOptionsFunction) =>
        dispatch(loadTermsFromCanonical(fetchOptions)),
    };
  }
)(injectIntl(withI18n(ResourceTermAssignmentsEdit)));
