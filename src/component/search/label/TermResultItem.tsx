import * as React from "react";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../../hoc/withI18n";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import AssetLink from "../../misc/AssetLink";
import Term from "../../../model/Term";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { loadTermByIri } from "../../../action/AsyncActions";
import { SearchResultItem } from "./SearchResults";
import AssetLabel from "../../misc/AssetLabel";
import AssetFactory from "../../../util/AssetFactory";
import TermItState from "../../../model/TermItState";
import FTSMatch from "./FTSMatch";
import TermBadge from "../../badge/TermBadge";
import { getTermPath } from "../../term/TermLink";
import { loadPublicTermByIri } from "../../../action/AsyncPublicViewActions";
import User from "../../../model/User";
import Authentication from "../../../util/Authentication";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";

interface TermResultItemOwnProps {
  result: SearchResultItem;
}

interface TermResultItemDispatchProps {
  loadTerm: (termIri: IRI) => Promise<Term | null>;
  loadPublicTerm: (termIri: IRI) => Promise<Term | null>;
}

interface TermResultItemStateProps {
  user: User;
}

interface TermResultItemProps
  extends TermResultItemOwnProps,
    TermResultItemDispatchProps,
    TermResultItemStateProps,
    HasI18n {}

interface TermResultItemState {
  text: string | undefined;
}

export class TermResultItem extends React.Component<
  TermResultItemProps,
  TermResultItemState
> {
  constructor(props: TermResultItemProps) {
    super(props);
    this.state = {
      text: undefined,
    };
  }

  public componentDidMount(): void {
    const indexOfDefinition = this.getIndexOf("definition");
    if (indexOfDefinition < 0) {
      const iri = VocabularyUtils.create(this.props.result.iri);
      const loader = Authentication.isLoggedIn(this.props.user)
        ? this.props.loadTerm
        : this.props.loadPublicTerm;
      loader(iri).then((term) => {
        if (term) {
          this.setState({
            text: term!.definition
              ? getLocalized(
                  term!.definition,
                  getShortLocale(this.props.locale)
                )
              : getLocalized(
                  term!.scopeNote,
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
    const i18n = this.props.i18n;
    const t = {
      iri: this.props.result.iri,
      label: (
        <>
          <span className="search-result-title">{this.props.result.label}</span>
          &nbsp;
          {this.props.result.vocabulary ? (
            <>
              {i18n("search.results.vocabulary.from")}&nbsp;
              <AssetLabel iri={this.props.result.vocabulary!.iri} />
            </>
          ) : (
            <></>
          )}
        </>
      ),
    };

    let text;
    if (this.getIndexOf("definition") > -1) {
      text = this.props.result.snippets[this.getIndexOf("definition")];
    } else {
      text = this.state.text;
    }

    if (text && text!.length > 200) {
      text = text!.substr(0, 200) + " ...";
    }

    const asset = AssetFactory.createAsset(this.props.result);
    return (
      <>
        <TermBadge className="search-result-badge" />
        <AssetLink
          asset={t}
          path={getTermPath(asset as Term, this.props.user)}
          tooltip={i18n("asset.link.tooltip")}
        />
        <br />
        <span className="search-result-snippet">
          {this.getIndexOf("definition") > -1 ? (
            <FTSMatch match={text || ""} />
          ) : (
            text
          )}
        </span>
      </>
    );
  }
}

export default connect<
  TermResultItemStateProps,
  TermResultItemDispatchProps,
  TermResultItemOwnProps,
  TermItState
>(
  (state: TermItState) => {
    return { user: state.user };
  },
  (dispatch: ThunkDispatch) => {
    return {
      loadTerm: (termIri: IRI) => dispatch(loadTermByIri(termIri)),
      loadPublicTerm: (termIri: IRI) => dispatch(loadPublicTermByIri(termIri)),
    };
  }
)(injectIntl(withI18n(TermResultItem)));
