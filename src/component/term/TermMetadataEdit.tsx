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
  FormGroup,
  Label,
  Row,
} from "reactstrap";
import Term, { CONTEXT, TermData } from "../../model/Term";
import CustomInput from "../misc/CustomInput";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermTypesEdit from "./TermTypesEdit";
import Utils from "../../util/Utils";
import UnmappedPropertiesEdit from "../genericmetadata/UnmappedPropertiesEdit";
import ParentTermSelector from "./ParentTermSelector";
import TermDefinitionBlockEdit from "./TermDefinitionBlockEdit";
import {
  getLocalized,
  getLocalizedOrDefault,
  getLocalizedPlural,
  hasNonBlankValue,
} from "../../model/MultilingualString";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import _ from "lodash";
import {
  checkLabelUniqueness,
  isTermValid,
  LabelExists,
} from "./TermValidationUtils";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import { ConsolidatedResults } from "../../model/ConsolidatedResults";
import ValidationResult from "../../model/form/ValidationResult";
import { renderValidationMessages } from "./forms/FormUtils";
import ExactMatchesSelector from "./ExactMatchesSelector";
import MultilingualIcon from "../misc/MultilingualIcon";
import RelatedTermsSelector from "./RelatedTermsSelector";
import { DefinitionRelatedChanges } from "./DefinitionRelatedTermsEdit";
import AttributeSectionContainer from "./../layout/AttributeSectionContainer";
import StringListEdit from "../misc/ValueListEdit";
import "./TermMetadata.scss";
import TermScopeNoteEdit from "./TermScopeNoteEdit";
import HelpIcon from "../misc/HelpIcon";
import TermStateSelector from "./state/TermStateSelector";
import Vocabulary from "../../model/Vocabulary";
import { PropertyValueType } from "../../model/WithUnmappedProperties";
import Message from "../../model/Message";
import MessageType from "../../model/MessageType";
import { ThunkDispatch } from "../../util/Types";
import { publishMessage as publishMessageAction } from "../../action/SyncActions";

interface TermMetadataEditProps extends HasI18n {
  term: Term;
  save: (
    term: Term,
    definitionRelatedChanges: DefinitionRelatedChanges
  ) => void;
  cancel: () => void;
  language: string;
  vocabularyPrimaryLanguage: string;
  publishMessage: (message: Message) => void;
  selectLanguage: (lang: string) => void;
  validationResults: ConsolidatedResults;
}

interface TermMetadataEditState extends TermData {
  labelExist: LabelExists;
  unmappedProperties: Map<string, PropertyValueType[]>;
  definitionRelated: DefinitionRelatedChanges;
}

export class TermMetadataEdit extends React.Component<
  TermMetadataEditProps,
  TermMetadataEditState
> {
  constructor(props: TermMetadataEditProps) {
    super(props);
    this.state = Object.assign(
      {
        labelExist: {},
        unmappedProperties: props.term.unmappedProperties,
        definitionRelated: {
          pendingApproval: [],
          pendingRemoval: [],
        },
      },
      props.term
    );
  }

  public componentDidUpdate(prevProps: TermMetadataEditProps): void {
    if (this.props.language && prevProps.language !== this.props.language) {
      this.onPrefLabelChange(this.state.label[this.props.language] || "");
    }
  }

  private onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.onPrefLabelChange(e.currentTarget.value);
  };

  public onPrefLabelChange = (prefLabel: string) => {
    const label = Object.assign({}, this.state.label);
    label[this.props.language] = prefLabel;
    const labelExist = Object.assign({}, this.state.labelExist);
    labelExist[this.props.language] = false;
    this.setState({ label, labelExist });

    const prefLabelCurrent = getLocalized(
      this.props.term.label,
      this.props.language
    ).toLowerCase();
    if (prefLabel.toLowerCase() === prefLabelCurrent) {
      return;
    }
    const vocabularyIri = VocabularyUtils.create(
      this.props.term.vocabulary!.iri!
    );
    checkLabelUniqueness(vocabularyIri, prefLabel, this.props.language, () => {
      labelExist[this.props.language] = true;
      this.setState({
        labelExist: Object.assign({}, this.state.labelExist, labelExist),
      });
    });
  };

  public onChange = (change: Partial<TermData>) => {
    // @ts-ignore
    this.setState(change);
  };

  public onHiddenLabelsChange = (hiddenLabels: string[]) => {
    this.setState({
      hiddenLabels: {
        ...this.state.hiddenLabels,
        ...this.pluralMultilingualChange(hiddenLabels),
      },
    });
  };

  public onAltLabelsChange = (altLabels: string[]) => {
    this.setState({
      altLabels: {
        ...this.state.altLabels,
        ...this.pluralMultilingualChange(altLabels),
      },
    });
  };

  public onExamplesChange = (examples: string[]) => {
    this.setState({
      examples: {
        ...this.state.examples,
        ...this.pluralMultilingualChange(examples),
      },
    });
  };

  private pluralMultilingualChange(newValue: string[]) {
    return Utils.createDynamicAttributeChange(this.props.language, newValue);
  }

  private onTypesChange = (types: string[]) => {
    this.setState({ types });
  };

  public onParentChange = (parentTerms: Term[]) => {
    this.setState({ parentTerms });
  };

  public onExactMatchesChange = (exactMatchTerms: Term[]) => {
    this.setState({
      exactMatchTerms: exactMatchTerms.map((e) => Term.toTermInfo(e)),
    });
  };

  /**
   * Distributes the specified value into related and relatedMatch based on each term's membership in the current term's vocabulary.
   * @param value Selected terms
   */
  public onRelatedChange = (value: Term[]) => {
    const split = TermMetadataEdit.splitTermsInSameAndDifferentVocabularies(
      value,
      this.props.term.vocabulary!.iri!
    );
    this.setState({
      relatedTerms: split.sameVocabulary.map((t) => Term.toTermInfo(t)),
      relatedMatchTerms: split.differentVocabulary.map((t) =>
        Term.toTermInfo(t)
      ),
    });
  };

  public onDefinitionRelatedChange = (value: DefinitionRelatedChanges) => {
    this.setState({ definitionRelated: value });
  };

  private static splitTermsInSameAndDifferentVocabularies(
    terms: Term[],
    vocabularyIri: string
  ) {
    const sameVocabulary: Term[] = [];
    const differentVocabulary: Term[] = [];
    terms.forEach((v) => {
      if (v.vocabulary!.iri === vocabularyIri) {
        sameVocabulary.push(v);
      } else {
        differentVocabulary.push(v);
      }
    });
    return { sameVocabulary, differentVocabulary };
  }

  public onStateChange = (stateIri: string) => {
    this.setState({ state: { iri: stateIri } });
  };

  private onPropertiesChange = (update: Map<string, PropertyValueType[]>) => {
    this.setState({ unmappedProperties: update });
  };

  private isInvalid = (): boolean => {
    return !isTermValid(
      this.state,
      this.state.labelExist,
      this.props.vocabularyPrimaryLanguage
    );
  };

  public onSave = () => {
    if (this.isInvalid()) {
      return;
    }
    const { labelExist, unmappedProperties, definitionRelated, ...data } =
      this.state;
    const t = new Term(data);
    t.unmappedProperties = this.state.unmappedProperties;
    this.props.save(t, definitionRelated);
  };

  public removeTranslation = (lang: string) => {
    if (lang === this.props.vocabularyPrimaryLanguage) {
      this.props.publishMessage(
        new Message(
          {
            messageId:
              "asset.modify.error.cannotRemoveVocabularyPrimaryLanguage",
          },
          MessageType.ERROR
        )
      );
      this.props.selectLanguage(this.props.language);
      return;
    }
    const copy = _.cloneDeep(this.state);
    Term.removeTranslation(copy, lang);
    this.setState(copy);
  };

  private getValidationResults = (prop: string) => {
    const results = this.props.validationResults
      ? this.props.validationResults[this.props.term.iri]
      : [];
    return (results || []).filter((r) => {
      if (prop !== VocabularyUtils.RDF_TYPE) {
        return r.resultPath && r.resultPath.iri === prop;
      } else {
        return !r.resultPath;
      }
    });
  };

  private getPrefLabelValidation() {
    const results: ValidationResult[] = [];
    const language = this.props.language;
    if (!hasNonBlankValue(this.state.label, language)) {
      results.push(ValidationResult.BLOCKER);
    } else if (this.state.labelExist[language]) {
      results.push(
        ValidationResult.blocker(
          this.props.formatMessage("term.metadata.labelExists.message", {
            label: getLocalized(this.state.label, language),
          })
        )
      );
    }
    this.getValidationResults(VocabularyUtils.SKOS_PREF_LABEL).forEach((vr) =>
      results.push(
        ValidationResult.fromOntoValidationResult(vr, this.props.locale)
      )
    );
    return results;
  }

  public render() {
    const { i18n, language, locale } = this.props;
    const validationAltLabel = this.getValidationResults(
      VocabularyUtils.SKOS_ALT_LABEL
    );
    const validationScopeNote = this.getValidationResults(
      VocabularyUtils.SKOS_SCOPE_NOTE
    );
    const validationBroader = this.getValidationResults(
      VocabularyUtils.BROADER
    );
    const validationType = this.getValidationResults(VocabularyUtils.RDF_TYPE);
    return (
      <>
        <EditLanguageSelector
          key="term-edit-language-selector"
          language={language}
          existingLanguages={Term.getLanguages(this.state)}
          onSelect={this.props.selectLanguage}
          onRemove={this.removeTranslation}
        />
        <Card id="edit-term">
          <CardBody>
            <Form>
              <Row>
                <Col xs={12}>
                  <CustomInput
                    name="edit-term-label"
                    value={getLocalizedOrDefault(
                      this.state.label,
                      "",
                      language
                    )}
                    onChange={this.onLabelChange}
                    label={
                      <>
                        {i18n("asset.label")}
                        <MultilingualIcon id="edit-term-label-multilingual" />
                      </>
                    }
                    validation={this.getPrefLabelValidation()}
                    help={i18n("term.label.help")}
                    hint={i18n("required")}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <StringListEdit
                    multilingual={true}
                    list={getLocalizedPlural(this.state.altLabels, language)}
                    onChange={this.onAltLabelsChange}
                    validationMessage={renderValidationMessages(
                      locale,
                      validationAltLabel
                    )}
                    i18nPrefix={"term.metadata.altLabels"}
                  />
                </Col>
              </Row>

              <AttributeSectionContainer
                label={i18n("term.metadata.definition")}
              >
                <TermDefinitionBlockEdit
                  term={this.state}
                  language={language}
                  getValidationResults={this.getValidationResults}
                  onChange={this.onChange}
                />
              </AttributeSectionContainer>

              <AttributeSectionContainer
                label={i18n("term.metadata.relationships")}
              >
                <Row>
                  <Col xs={12}>
                    <ExactMatchesSelector
                      id="exact-matches"
                      termIri={this.props.term.iri}
                      selected={this.state.exactMatchTerms}
                      vocabularyIri={this.props.term.vocabulary!.iri!}
                      onChange={this.onExactMatchesChange}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <ParentTermSelector
                      id="edit-term-parent"
                      termIri={this.props.term.iri}
                      parentTerms={this.state.parentTerms}
                      validationMessage={renderValidationMessages(
                        this.props.locale,
                        validationBroader
                      )}
                      vocabularyIri={this.props.term.vocabulary!.iri!}
                      onChange={this.onParentChange}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <TermTypesEdit
                      termTypes={Utils.sanitizeArray(this.state.types)}
                      validationMessage={renderValidationMessages(
                        this.props.locale,
                        validationType
                      )}
                      onChange={this.onTypesChange}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <RelatedTermsSelector
                      id="edit-term-related"
                      term={this.props.term}
                      vocabularyIri={this.props.term.vocabulary?.iri!}
                      selected={Term.consolidateRelatedAndRelatedMatch(
                        this.state,
                        this.props.language
                      )}
                      onChange={this.onRelatedChange}
                      language={language}
                      definitionRelatedChanges={this.state.definitionRelated}
                      onDefinitionRelatedChange={this.onDefinitionRelatedChange}
                    />
                  </Col>
                </Row>
              </AttributeSectionContainer>
              <AttributeSectionContainer label={""}>
                <Row>
                  <Col xs={12}>
                    <StringListEdit
                      multilingual={true}
                      list={getLocalizedPlural(
                        this.state.hiddenLabels,
                        language
                      )}
                      onChange={this.onHiddenLabelsChange}
                      i18nPrefix={"term.metadata.hiddenLabels"}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <StringListEdit
                      list={this.state.notations}
                      onChange={(value) => this.setState({ notations: value })}
                      i18nPrefix={"term.metadata.notation"}
                    />
                  </Col>
                </Row>
                <TermScopeNoteEdit
                  term={this.state}
                  language={language}
                  onChange={this.onChange}
                  validationResult={validationScopeNote}
                />
                <Row>
                  <Col xs={12}>
                    <StringListEdit
                      multilingual={true}
                      list={getLocalizedPlural(this.state.examples, language)}
                      onChange={this.onExamplesChange}
                      i18nPrefix={"term.metadata.example"}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <FormGroup>
                      <Label
                        id="term-metadata-edit-status"
                        className="attribute-label"
                      >
                        {i18n("term.metadata.status")}
                        <HelpIcon
                          id="term-metadata-status"
                          text={i18n("term.metadata.status.help")}
                        />
                      </Label>
                      <br />
                      <TermStateSelector
                        value={this.state.state}
                        onChange={this.onStateChange}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </AttributeSectionContainer>

              <Row>
                <Col xs={12}>
                  <UnmappedPropertiesEdit
                    assetType="term"
                    properties={this.state.unmappedProperties}
                    ignoredProperties={TermMetadataEdit.mappedPropertiesToIgnore()}
                    onChange={this.onPropertiesChange}
                    language={language}
                    languages={Vocabulary.getLanguages(this.state)}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <ButtonToolbar className="d-flex justify-content-center mt-4">
                    <Button
                      id="edit-term-submit"
                      color="success"
                      disabled={this.isInvalid()}
                      size="sm"
                      onClick={this.onSave}
                    >
                      {i18n("save")}
                    </Button>
                    <Button
                      id="edit-term-cancel"
                      color="outline-dark"
                      size="sm"
                      onClick={this.props.cancel}
                    >
                      {i18n("cancel")}
                    </Button>
                  </ButtonToolbar>
                </Col>
              </Row>
            </Form>
          </CardBody>
        </Card>
      </>
    );
  }

  private static mappedPropertiesToIgnore() {
    const toIgnore = Object.getOwnPropertyNames(CONTEXT).map((n) => CONTEXT[n]);
    toIgnore.push(VocabularyUtils.RDF_TYPE);
    return toIgnore;
  }
}

export default connect(
  (state: TermItState) => {
    return {
      validationResults: state.validationResults[state.vocabulary.iri],
      vocabulary: state.vocabulary,
      vocabularyPrimaryLanguage:
        state.vocabulary.primaryLanguage || state.configuration.language,
    };
  },
  (dispatch: ThunkDispatch) => {
    return {
      publishMessage: (message: Message) =>
        dispatch(publishMessageAction(message)),
    };
  }
)(injectIntl(withI18n(TermMetadataEdit)));
