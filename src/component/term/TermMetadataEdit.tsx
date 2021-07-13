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
  Row,
} from "reactstrap";
import Term, { CONTEXT, TermData, TermInfo } from "../../model/Term";
import "./TermMetadata.scss";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermTypesEdit from "./TermTypesEdit";
import Utils from "../../util/Utils";
import UnmappedPropertiesEdit from "../genericmetadata/UnmappedPropertiesEdit";
import ParentTermSelector from "./ParentTermSelector";
import DraftToggle from "./DraftToggle";
import TermDefinitionBlockEdit from "./TermDefinitionBlockEdit";
import TermDefinitionContainer from "./TermDefinitionContainer";
import StringListEdit from "../misc/StringListEdit";
import {
  getLocalized,
  getLocalizedOrDefault,
  getLocalizedPlural,
} from "../../model/MultilingualString";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import * as _ from "lodash";
import {
  checkLabelUniqueness,
  isLabelValid,
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

interface TermMetadataEditProps extends HasI18n {
  term: Term;
  save: (term: Term) => void;
  cancel: () => void;
  language: string;
  selectLanguage: (lang: string) => void;
  validationResults: ConsolidatedResults;
}

interface TermMetadataEditState extends TermData {
  labelExist: LabelExists;
  unmappedProperties: Map<string, string[]>;
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
      },
      props.term
    );
  }

  public componentDidUpdate(
    prevProps: TermMetadataEditProps,
    prevState: TermMetadataEditState
  ): void {
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

  public onScopeNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const change = {};
    change[this.props.language] = value;
    this.setState({
      scopeNote: Object.assign({}, this.state.scopeNote, change),
    });
  };

  public onChange = (change: Partial<TermData>) => {
    // @ts-ignore
    this.setState(change);
  };

  public onHiddenLabelsChange = (hiddenLabels: string[]) => {
    const language = this.props.language;
    const change = {};
    change[language] = hiddenLabels;
    this.setState({
      hiddenLabels: Object.assign({}, this.state.hiddenLabels, change),
    });
  };

  public onAltLabelsChange = (altLabels: string[]) => {
    const language = this.props.language;
    const change = {};
    change[language] = altLabels;
    this.setState({
      altLabels: Object.assign({}, this.state.altLabels, change),
    });
  };

  private onTypesChange = (newTypes: string[]) => {
    this.setState({ types: newTypes });
  };

  public onParentChange = (parentTerms?: Term[]) => {
    this.setState({ parentTerms });
  };

  public onExactMatchesChange = (exactMatchTerms: Term[]) => {
    this.setState({
      exactMatchTerms: exactMatchTerms.map((e) => e as TermInfo),
    });
  };

  /**
   * Distributes the specified value into related and relatedMatch based on each term's membership in the current term's vocabulary.
   * @param value Selected terms
   */
  public onRelatedChange = (value: Term[]) => {
    const relatedTerms: TermInfo[] = [];
    const relatedMatchTerms: TermInfo[] = [];
    value.forEach((v) => {
      if (v.vocabulary!.iri === this.props.term.vocabulary!.iri) {
        relatedTerms.push(Term.toTermInfo(v));
      } else {
        relatedMatchTerms.push(Term.toTermInfo(v));
      }
    });
    this.setState({ relatedTerms, relatedMatchTerms });
  };

  public onStatusChange = () => {
    this.setState({ draft: !this.state.draft });
  };

  private onPropertiesChange = (update: Map<string, string[]>) => {
    this.setState({ unmappedProperties: update });
  };

  public onSave = () => {
    const { labelExist, unmappedProperties, ...data } = this.state;
    const t = new Term(data);
    t.unmappedProperties = this.state.unmappedProperties;
    this.props.save(t);
  };

  public removeTranslation = (lang: string) => {
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
    if (!isLabelValid(this.state, language)) {
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
          term={this.state}
          language={language}
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

              <TermDefinitionContainer>
                <TermDefinitionBlockEdit
                  term={this.state}
                  language={language}
                  getValidationResults={this.getValidationResults}
                  onChange={this.onChange}
                />
              </TermDefinitionContainer>

              <Row>
                <Col xs={12}>
                  <TextArea
                    name="edit-term-comment"
                    value={getLocalizedOrDefault(
                      this.state.scopeNote,
                      "",
                      language
                    )}
                    validation={validationScopeNote.map((vr) =>
                      ValidationResult.fromOntoValidationResult(vr, locale)
                    )}
                    onChange={this.onScopeNoteChange}
                    rows={4}
                    label={
                      <>
                        {i18n("term.metadata.comment")}
                        <MultilingualIcon id="edit-term-comment-multilingual" />
                      </>
                    }
                    help={i18n("term.comment.help")}
                  />
                </Col>
              </Row>
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
                    termIri={this.props.term.iri}
                    vocabularyIri={this.props.term.vocabulary?.iri!}
                    selected={Term.consolidateRelatedAndRelatedMatch(
                      this.state
                    )}
                    onChange={this.onRelatedChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <StringListEdit
                    list={getLocalizedPlural(this.state.hiddenLabels, language)}
                    onChange={this.onHiddenLabelsChange}
                    i18nPrefix={"term.metadata.hiddenLabels"}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <DraftToggle
                    id="edit-term-status"
                    draft={
                      this.state.draft === undefined ? true : this.state.draft!
                    }
                    onToggle={this.onStatusChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <UnmappedPropertiesEdit
                    properties={this.state.unmappedProperties}
                    ignoredProperties={TermMetadataEdit.mappedPropertiesToIgnore()}
                    onChange={this.onPropertiesChange}
                  />
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <ButtonToolbar className="d-flex justify-content-center mt-4">
                    <Button
                      id="edit-term-submit"
                      color="success"
                      disabled={!isTermValid(this.state, this.state.labelExist)}
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

export default connect((state: TermItState) => {
  return {
    validationResults: state.validationResults[state.vocabulary.iri],
  };
})(injectIntl(withI18n(TermMetadataEdit)));
