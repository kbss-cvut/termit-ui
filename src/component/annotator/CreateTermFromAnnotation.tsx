import * as React from "react";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Term, { TermData } from "../../model/Term";
import {
  Button,
  ButtonToolbar,
  Card,
  CardBody,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from "reactstrap";
import TermMetadataCreateForm from "../term/TermMetadataCreateForm";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { ThunkDispatch } from "../../util/Types";
import { createTerm } from "../../action/AsyncTermActions";
import { IRI } from "../../util/VocabularyUtils";
import AssetFactory from "../../util/AssetFactory";
import {
  hasNonBlankValue,
  langString,
  MultilingualString,
} from "../../model/MultilingualString";
import TermItState from "../../model/TermItState";
import { isTermValid, LabelExists } from "../term/TermValidationUtils";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";
import { publishMessage as publishMessageAction } from "../../action/SyncActions";

interface CreateTermFromAnnotationProps extends HasI18n {
  show: boolean;
  onClose: () => void;
  onMinimize: () => void; // Minimize will be used to allow the user to select definition for a term being created
  onTermCreated: (term: Term) => void;
  vocabularyIri: IRI;
  fileLanguage?: string;
  vocabularyPrimaryLanguage: string;

  createTerm: (term: Term, vocabularyIri: IRI) => Promise<any>;
  publishMessage: (message: Message) => void;
}

interface CreateTermFromAnnotationState extends TermData {
  labelExists: LabelExists;
  selectedLanguage: string;
}

function insertEmptyTranslationIfNotExists(
  str: MultilingualString,
  language: string
) {
  if (!hasNonBlankValue(str, language)) {
    str[language] = "";
  }
}

export class CreateTermFromAnnotation extends React.Component<
  CreateTermFromAnnotationProps,
  CreateTermFromAnnotationState
> {
  constructor(props: CreateTermFromAnnotationProps) {
    super(props);
    const language =
      this.props.fileLanguage || this.props.vocabularyPrimaryLanguage;

    this.state = Object.assign({}, AssetFactory.createEmptyTermData(language), {
      labelExists: {},
      selectedLanguage: language,
    });

    insertEmptyTranslationIfNotExists(
      this.state.label,
      this.props.vocabularyPrimaryLanguage
    );
  }

  /**
   * Part of public imperative API allowing to set label so that the whole term does not have to be kept in parent
   * component state.
   */
  public setLabel(newLabel: string) {
    const label = langString(newLabel.trim(), this.state.selectedLanguage);
    insertEmptyTranslationIfNotExists(
      label,
      this.props.vocabularyPrimaryLanguage
    );
    this.setState({ label });
  }

  /**
   * Part of public imperative API allowing to set definition so that the whole term does not have to be kept in
   * parent component state.
   */
  public setDefinition(definition: string) {
    this.setState({
      definition: langString(definition.trim(), this.state.selectedLanguage),
    });
  }

  public onChange = (change: object, callback?: () => void) => {
    this.setState(change, callback);
  };

  public onSave = () => {
    const newTerm = new Term(this.state);
    this.props.createTerm(newTerm, this.props.vocabularyIri).then(() => {
      this.props.onTermCreated(newTerm);
      this.onCancel();
    });
  };

  public onCancel = () => {
    const stateChange = AssetFactory.createEmptyTermData(
      this.props.fileLanguage || this.props.vocabularyPrimaryLanguage
    );
    insertEmptyTranslationIfNotExists(
      stateChange.label,
      this.props.vocabularyPrimaryLanguage
    );
    this.setState(stateChange);
    this.props.onClose();
  };

  private setLanguage = (language: string) => {
    this.setState({ selectedLanguage: language });
  };

  private onRemoveTranslation = (language: string) => {
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
      this.setLanguage(this.state.selectedLanguage);
      return;
    }
  };

  public render() {
    const i18n = this.props.i18n;
    const invalid = !isTermValid(
      this.state,
      this.state.labelExists,
      this.props.vocabularyPrimaryLanguage
    );
    return (
      <Modal
        id="annotator-create-term"
        isOpen={this.props.show}
        toggle={this.onCancel}
        size="lg"
      >
        <ModalHeader>{i18n("glossary.form.header")}</ModalHeader>
        <ModalBody>
          <EditLanguageSelector
            language={this.state.selectedLanguage}
            existingLanguages={Term.getLanguages(this.state)}
            onSelect={this.setLanguage}
            onRemove={this.onRemoveTranslation}
          />
          <Card id="create-term">
            <CardBody>
              <TermMetadataCreateForm
                onChange={this.onChange}
                termData={this.state}
                language={this.state.selectedLanguage}
                definitionSelector={this.props.onMinimize}
                vocabularyIri={
                  this.props.vocabularyIri.namespace +
                  this.props.vocabularyIri.fragment
                }
                labelExist={this.state.labelExists}
              />
              <Row>
                <Col xs={12}>
                  <ButtonToolbar className="d-flex justify-content-center mt-4">
                    <Button
                      id="create-term-submit"
                      color="success"
                      onClick={this.onSave}
                      disabled={invalid}
                      size="sm"
                    >
                      {i18n("glossary.form.button.submit")}
                    </Button>
                    <Button
                      id="create-term-cancel"
                      color="outline-dark"
                      size="sm"
                      onClick={this.onCancel}
                    >
                      {i18n("glossary.form.button.cancel")}
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </ModalBody>
      </Modal>
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
      createTerm: (term: Term, vocabularyIri: IRI) =>
        dispatch(createTerm(term, vocabularyIri)),
      publishMessage: (message: Message) =>
        dispatch(publishMessageAction(message)),
    };
  },
  undefined,
  { forwardRef: true }
)(
  injectIntl(withI18n(CreateTermFromAnnotation, { forwardRef: true }), {
    forwardRef: true,
  })
);
