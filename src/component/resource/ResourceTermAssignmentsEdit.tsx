import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import { FormGroup, Label } from "reactstrap";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import "intelligent-tree-select/lib/styles.css";
import Term from "../../model/Term";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import FetchOptionsFunction from "../../model/Functions";
import { searchTerms } from "../../action/AsyncActions";
import {
  commonTermTreeSelectProps,
  processTermsForTreeSelect,
} from "../term/TermTreeSelectHelper";

interface PropsExternal {
  terms: Term[];
  onChange: (subTerms: Term[]) => void;
}

interface PropsConnected {}

interface DispatchConnected {
  fetchTerms: (searchString: string) => Promise<Term[]>;
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

  public fetchOptions = (fetchOptions: FetchOptionsFunction) => {
    const all = [...this.props.terms]; // Make a copy of the resource's terms to prevent their accidental editing

    // TODO hack to have the search fast - looks for vowels and syllabic consonants in czech and english. Thus works
    // only for terms which are words.
    const searchString = fetchOptions.searchString || "a e i o u y r l s m n";

    return this.props
      .fetchTerms(searchString)
      .then((terms) =>
        processTermsForTreeSelect(terms, undefined, { searchString })
      )
      .then((terms) => {
        const toReturn = processTermsForTreeSelect(all, undefined, {
          searchString,
        });
        return toReturn.concat(terms);
      });
  };

  public render() {
    const selected = (this.props.terms || []).map((t) => t.iri!);
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
          value={selected}
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
      fetchTerms: (searchString: string) => dispatch(searchTerms(searchString)),
    };
  }
)(injectIntl(withI18n(ResourceTermAssignmentsEdit)));
