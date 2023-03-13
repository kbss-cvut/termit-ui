import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../../hoc/withI18n";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { SearchResultItem } from "./SearchResults";
import TermItState from "../../../model/TermItState";
import FTSMatch from "./FTSMatch";
import { getRdfsResource } from "../../../action/AsyncActions";
import RdfsResource from "../../../model/RdfsResource";
import Vocabulary from "../../../model/Vocabulary";
import VocabularyLink from "../../vocabulary/VocabularyLink";
import AssetFactory from "../../../util/AssetFactory";
import VocabularyBadge from "../../badge/VocabularyBadge";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";

interface VocabularyResultItemOwnProps {
  result: SearchResultItem;
}

interface VocabularyResultItemDispatchProps {
  getResource: (iri: IRI) => Promise<RdfsResource | undefined>;
}

interface VocabularyResultItemStateProps {}

interface VocabularyResultItemProps
  extends VocabularyResultItemOwnProps,
    VocabularyResultItemDispatchProps,
    VocabularyResultItemStateProps,
    HasI18n {}

interface VocabularyResultItemState {
  comment?: string | null;
}

export class VocabularyResultItem extends React.Component<
  VocabularyResultItemProps,
  VocabularyResultItemState
> {
  constructor(props: VocabularyResultItemProps) {
    super(props);
    this.state = {
      comment: null,
    };
  }

  public componentDidMount(): void {
    const indexOfComment = this.getIndexOf("comment");
    if (indexOfComment < 0) {
      const iri = VocabularyUtils.create(this.props.result.iri);
      this.props.getResource(iri).then((resource) => {
        if (resource) {
          this.setState({
            comment: getLocalized(
              resource.comment,
              getShortLocale(this.props.locale)
            ),
          });
        }
      });
    }
  }

  private getIndexOf(field: string) {
    return this.props.result.snippetFields.indexOf(field);
  }

  public render() {
    let text;
    if (this.getIndexOf("comment") > -1) {
      text = this.props.result.snippets[this.getIndexOf("comment")];
    } else {
      text = this.state.comment || "";
    }

    if (text && text!.length > 200) {
      text = text!.substring(0, 200) + " ...";
    }

    const res = this.props.result;
    return (
      <>
        <VocabularyBadge className="search-result-badge" />
        <span className="search-result-title">
          <VocabularyLink
            vocabulary={AssetFactory.createAsset(res) as Vocabulary}
          />
        </span>
        <br />
        <span className="search-result-snippet">
          <FTSMatch match={text || ""} />
        </span>
      </>
    );
  }
}

export default connect<
  VocabularyResultItemStateProps,
  VocabularyResultItemDispatchProps,
  VocabularyResultItemOwnProps,
  TermItState
>(undefined, (dispatch: ThunkDispatch) => {
  return {
    getResource: (iri: IRI) => dispatch(getRdfsResource(iri)),
  };
})(injectIntl(withI18n(VocabularyResultItem)));
