import * as React from "react";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import { injectIntl } from "react-intl";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term from "../../model/Term";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadTermByIri } from "../../action/AsyncActions";
import TermLink from "./TermLink";
import OutgoingLink from "../misc/OutgoingLink";
import TermItState from "../../model/TermItState";
import { loadPublicTermByIri } from "../../action/AsyncPublicViewActions";
import User from "../../model/User";
import Authentication from "../../util/Authentication";

interface TermIriLinkProps extends HasI18n {
  iri: string;
  id?: string;
  loadTermByIri: (iri: IRI) => Promise<Term | null>;
  loadPublicTermByIri: (iri: IRI) => Promise<Term | null>;
  user: User;
}

interface TermIriLinkState {
  term: Term | null;
}

export class TermIriLink extends React.Component<
  TermIriLinkProps,
  TermIriLinkState
> {
  constructor(props: TermIriLinkProps) {
    super(props);
    this.state = { term: null };
  }

  public componentDidMount(): void {
    const iri = VocabularyUtils.create(this.props.iri);
    let loader;
    if (Authentication.isLoggedIn(this.props.user)) {
      loader = this.props.loadTermByIri;
    } else {
      loader = this.props.loadPublicTermByIri;
    }
    loader(iri).then((term) => this.setState({ term }));
  }

  public render() {
    return (
      <>
        {this.state.term !== null ? (
          <TermLink term={this.state.term} />
        ) : (
          <OutgoingLink label={this.props.iri} iri={this.props.iri} />
        )}
      </>
    );
  }
}

export default connect(
  (state: TermItState) => ({ user: state.user }),
  (dispatch: ThunkDispatch) => {
    return {
      loadTermByIri: (iri: IRI) => dispatch(loadTermByIri(iri)),
      loadPublicTermByIri: (iri: IRI) => dispatch(loadPublicTermByIri(iri)),
    };
  }
)(injectIntl(withI18n(TermIriLink)));
