import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar, Card, CardBody, Col, Form, Row} from "reactstrap";
import Term, {CONTEXT, TermData} from "../../model/Term";
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
import {getLocalized, getLocalizedOrDefault, getLocalizedPlural} from "../../model/MultilingualString";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";
import * as _ from "lodash";
import {checkLabelUniqueness, isLabelValid, isTermValid, LabelExists} from "./TermValidationUtils";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import {ConsolidatedResults} from "../../model/ConsolidatedResults";
import ValidationResult from "../../model/ValidationResult";
import {renderValidationMessages} from "./forms/FormUtils";

interface TermMetadataEditProps extends HasI18n {
    term: Term,
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

export class TermMetadataEdit extends React.Component<TermMetadataEditProps, TermMetadataEditState> {
    constructor(props: TermMetadataEditProps) {
        super(props);
        this.state = Object.assign({
            labelExist: {},
            unmappedProperties: props.term.unmappedProperties
        }, props.term);
    }

    public componentDidUpdate(prevProps: TermMetadataEditProps, prevState: TermMetadataEditState): void {
        if (this.props.language && (prevProps.language !== this.props.language)) {
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
        this.setState({label, labelExist});

        const prefLabelCurrent = getLocalized(this.props.term.label, this.props.language).toLowerCase();
        if (prefLabel.toLowerCase() === prefLabelCurrent) {
            return;
        }
        const vocabularyIri = VocabularyUtils.create(this.props.term.vocabulary!.iri!);
        checkLabelUniqueness(vocabularyIri, prefLabel, this.props.language, () => {
            labelExist[this.props.language] = true;
            this.setState({
                labelExist: Object.assign({}, this.state.labelExist, labelExist)
            });
        });
    };

    public onScopeNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.value;
        const change = {};
        change[this.props.language] = value;
        this.setState({scopeNote: Object.assign({}, this.state.scopeNote, change)});
    };

    public onChange = (change: Partial<TermData>) => {
        // @ts-ignore
        this.setState(change);
    }

    public onHiddenLabelsChange = (hiddenLabels: string[]) => {
        const language = this.props.language;
        const change = {};
        change[language] = hiddenLabels;
        this.setState({hiddenLabels: Object.assign({}, this.state.hiddenLabels, change)});
    };

    public onAltLabelsChange = (altLabels: string[]) => {
        const language = this.props.language;
        const change = {};
        change[language] = altLabels;
        this.setState({altLabels: Object.assign({}, this.state.altLabels, change)});
    };

    private onTypesChange = (newTypes: string[]) => {
        this.setState({types: newTypes});
    };

    public onParentChange = (parentTerms?: Term[]) => {
        this.setState({parentTerms});
    };

    public onStatusChange = () => {
        this.setState({draft: !this.state.draft});
    }

    private onPropertiesChange = (update: Map<string, string[]>) => {
        this.setState({unmappedProperties: update});
    };

    public onSave = () => {
        const {labelExist, unmappedProperties, ...data} = this.state;
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
        const results = this.props.validationResults ? this.props.validationResults[this.props.term.iri] : [];
        return (results || []).filter(r => {
            if (prop !== VocabularyUtils.RDF_TYPE) {
                return r.resultPath && r.resultPath.iri === prop
            } else {
                return !r.resultPath
            }
        })
    }

    private renderMessages(results: ValidationResult[]) {
        return renderValidationMessages(this.props.locale, results);
    }

    public render() {
        const {i18n, language} = this.props;
        const t = this.onStatusChange.bind(this);
        const labelInLanguageInvalid = !isLabelValid(this.state, language) || this.state.labelExist[language];
        const invalid = !isTermValid(this.state, this.state.labelExist);
        const validationPrefLabel = this.getValidationResults(VocabularyUtils.SKOS_PREF_LABEL);
        const validationAltLabel = this.getValidationResults(VocabularyUtils.SKOS_ALT_LABEL);
        const validationScopeNote = this.getValidationResults(VocabularyUtils.SKOS_SCOPE_NOTE);
        const validationBroader = this.getValidationResults(VocabularyUtils.BROADER);
        const validationType = this.getValidationResults(VocabularyUtils.RDF_TYPE);
        return <>
            <EditLanguageSelector key="term-edit-language-selector" term={this.state} language={language}
                                  onSelect={this.props.selectLanguage} onRemove={this.removeTranslation}/>
            <Card id="edit-term">
                <CardBody>
                    <Form>
                        <Row>
                            <Col xs={12}>
                                <CustomInput name="edit-term-label"
                                             value={getLocalizedOrDefault(this.state.label, "", language)}
                                             onChange={this.onLabelChange}
                                             label={i18n("asset.label")}
                                             invalid={validationPrefLabel.length > 0 || labelInLanguageInvalid}
                                             invalidMessage={this.renderMessages(validationPrefLabel) +
                                             (labelInLanguageInvalid ?
                                                 this.props.formatMessage("term.metadata.labelExists.message", {label: getLocalized(this.state.label, language)}) :
                                                 "")}
                                             help={i18n("term.label.help")}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <StringListEdit list={getLocalizedPlural(this.state.altLabels, language)}
                                                onChange={this.onAltLabelsChange}
                                                invalid={validationAltLabel.length > 0 || labelInLanguageInvalid}
                                                invalidMessage={this.renderMessages(validationAltLabel)}
                                                i18nPrefix={"term.metadata.altLabels"}/>
                            </Col>
                        </Row>

                        <TermDefinitionContainer>
                            <TermDefinitionBlockEdit term={this.state} language={language}
                                                     getValidationResults={this.getValidationResults}
                                                     onChange={this.onChange}/>
                        </TermDefinitionContainer>

                        <Row>
                            <Col xs={12}>
                                <TextArea name="edit-term-comment"
                                          value={getLocalizedOrDefault(this.state.scopeNote, "", language)}
                                          invalid={validationScopeNote.length > 0}
                                          invalidMessage={this.renderMessages(validationScopeNote)}
                                          onChange={this.onScopeNoteChange} rows={4}
                                          label={i18n("term.metadata.comment")}
                                          help={i18n("term.comment.help")}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <ParentTermSelector id="edit-term-parent" termIri={this.props.term.iri}
                                                    parentTerms={this.state.parentTerms}
                                                    invalid={validationBroader.length > 0}
                                                    invalidMessage={this.renderMessages(validationBroader)}
                                                    vocabularyIri={this.props.term.vocabulary!.iri!}
                                                    onChange={this.onParentChange}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <TermTypesEdit termTypes={Utils.sanitizeArray(this.state.types)}
                                               invalid={validationType.length > 0}
                                               invalidMessage={this.renderMessages(validationType)}
                                               onChange={this.onTypesChange}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <StringListEdit list={getLocalizedPlural(this.state.hiddenLabels, language)}
                                                onChange={this.onHiddenLabelsChange}
                                                i18nPrefix={"term.metadata.hiddenLabels"}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <DraftToggle id="edit-term-status"
                                             draft={(this.state.draft === undefined) ? true : this.state.draft!}
                                             onToggle={t}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <UnmappedPropertiesEdit properties={this.state.unmappedProperties}
                                                        ignoredProperties={TermMetadataEdit.mappedPropertiesToIgnore()}
                                                        onChange={this.onPropertiesChange}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <ButtonToolbar className="d-flex justify-content-center mt-4">
                                    <Button id="edit-term-submit" color="success" disabled={invalid} size="sm"
                                            onClick={this.onSave}>{i18n("save")}</Button>
                                    <Button id="edit-term-cancel" color="outline-dark" size="sm"
                                            onClick={this.props.cancel}>{i18n("cancel")}</Button>
                                </ButtonToolbar>
                            </Col>
                        </Row>
                    </Form>
                </CardBody>
            </Card>
        </>;
    }

    private static mappedPropertiesToIgnore() {
        const toIgnore = Object.getOwnPropertyNames(CONTEXT).map(n => CONTEXT[n]);
        toIgnore.push(VocabularyUtils.RDF_TYPE);
        return toIgnore;
    }
}

export default connect((state: TermItState) => {
    return {
        validationResults: state.validationResults[state.vocabulary.iri]
    };
})(injectIntl(withI18n(TermMetadataEdit)));
