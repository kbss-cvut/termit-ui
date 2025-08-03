import * as React from "react";
import { Button, ButtonToolbar, Card, CardBody, Col, Row } from "reactstrap";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import { RouteComponentProps, withRouter } from "react-router";
import Term, { TermData } from "../../model/Term";
import Utils from "../../util/Utils";
import { injectIntl } from "react-intl";
import TermMetadataCreateForm from "./TermMetadataCreateForm";
import AssetFactory from "../../util/AssetFactory";
import HeaderWithActions from "../misc/HeaderWithActions";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import _ from "lodash";
import { isTermValid } from "./TermValidationUtils";
import { publishMessage as publishMessageAction } from "../../action/SyncActions";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";
import { ThunkDispatch } from "../../util/Types";

interface TermMetadataCreateOwnProps {
  onCreate: (term: Term, newTerm: boolean) => void;
  vocabularyIri: string;
  vocabularyPrimaryLanguage: string;
  publishMessage: (message: Message) => void;
}

declare type TermMetadataCreateProps = TermMetadataCreateOwnProps &
  HasI18n &
  RouteComponentProps<any>;

interface CreateVocabularyTermState extends TermData {
  language: string;
  labelExist: { [lang: string]: boolean };
}

export class TermMetadataCreate extends React.Component<
  TermMetadataCreateProps,
  CreateVocabularyTermState
> {
  constructor(props: TermMetadataCreateProps) {
    super(props);
    this.state = Object.assign(
      AssetFactory.createEmptyTermData(props.vocabularyPrimaryLanguage),
      {
        language: props.vocabularyPrimaryLanguage,
        labelExist: {},
      }
    );
  }

  private cancelCreation = () => {
    const normalizedName = this.props.match.params.name;
    const namespace = Utils.extractQueryParam(
      this.props.location.search,
      "namespace"
    );
    Routing.transitionTo(Routes.vocabularySummary, {
      params: new Map([["name", normalizedName]]),
      query: namespace ? new Map([["namespace", namespace]]) : undefined,
    });
  };

  private isInvalid = (): boolean => {
    return !isTermValid(
      this.state,
      this.state.labelExist,
      this.props.vocabularyPrimaryLanguage
    );
  };

  private onSave = () => {
    if (this.isInvalid()) {
      return;
    }
    const t = new Term(this.state);
    // @ts-ignore
    delete t.language;
    this.props.onCreate(t, false);
  };

  private onSaveAndGoToNewTerm = () => {
    if (this.isInvalid()) {
      return;
    }
    const t = new Term(this.state);
    // @ts-ignore
    delete t.language;
    this.props.onCreate(new Term(t), true);
  };

  public onChange = (change: object, callback?: () => void) => {
    this.setState(change, callback);
  };

  public setLanguage = (language: string) => {
    this.setState({ language });
  };

  public onRemoveTranslation = (language: string) => {
    if (language === this.props.vocabularyPrimaryLanguage) {
      this.props.publishMessage(
        new Message(
          {
            messageId:
              "asset.modify.error.cannotRemoveVocabularyPrimaryLanguage",
          },
          MessageType.ERROR
        )
      );
      this.setLanguage(this.state.language);
      return;
    }
    const copy = _.cloneDeep(this.state);
    Term.removeTranslation(copy, language);
    delete copy.labelExist[language];
    this.setState(copy);
  };

  public render() {
    const i18n = this.props.i18n;
    const invalid = this.isInvalid();

    return (
      <>
        <HeaderWithActions title={i18n("glossary.form.header")} />
        <EditLanguageSelector
          language={this.state.language}
          existingLanguages={Term.getLanguages(this.state)}
          onSelect={this.setLanguage}
          onRemove={this.onRemoveTranslation}
        />
        <Card id="create-term">
          <CardBody>
            <TermMetadataCreateForm
              onChange={this.onChange}
              termData={this.state}
              language={this.state.language}
              vocabularyIri={this.props.vocabularyIri}
              labelExist={this.state.labelExist}
            />
            <Row>
              <Col md={12}>
                <ButtonToolbar className="d-flex justify-content-center mt-4">
                  <Button
                    id="create-term-submit"
                    color="success"
                    onClick={this.onSave}
                    size="sm"
                    disabled={invalid}
                  >
                    {i18n("glossary.form.button.submit")}
                  </Button>
                  <Button
                    id="create-term-submit-and-go-to-new-term"
                    color="success"
                    onClick={this.onSaveAndGoToNewTerm}
                    size="sm"
                    disabled={invalid}
                  >
                    {i18n("glossary.form.button.submitAndGoToNewTerm")}
                  </Button>
                  <Button
                    id="create-term-cancel"
                    color="outline-dark"
                    size="sm"
                    onClick={this.cancelCreation}
                  >
                    {i18n("glossary.form.button.cancel")}
                  </Button>
                </ButtonToolbar>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </>
    );
  }
}

export default connect(
  (state: TermItState) => ({
    vocabularyPrimaryLanguage:
      state.vocabulary.primaryLanguage || state.configuration.language,
  }),
  (dispatch: ThunkDispatch) => {
    return {
      publishMessage: (message: Message) =>
        dispatch(publishMessageAction(message)),
    };
  }
)(withRouter(injectIntl(withI18n(TermMetadataCreate))));
