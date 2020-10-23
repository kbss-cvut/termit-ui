import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TermData} from "../../model/Term";
import Utils from "../../util/Utils";
import Ajax, {params} from "../../util/Ajax";
import Constants from "../../util/Constants";
import {Button, Col, Collapse, Form, FormGroup, Label, Row} from "reactstrap";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";
import TermTypesEdit from "./TermTypesEdit";
import ParentTermSelector from "./ParentTermSelector";
import VocabularyUtils from "../../util/VocabularyUtils";
import {injectIntl} from "react-intl";
import StringListEdit from "../misc/StringListEdit";
import {getLocalized, getLocalizedOrDefault, getLocalizedPlural} from "../../model/MultilingualString";

interface TermMetadataCreateFormProps extends HasI18n {
    onChange: (change: object, callback?: () => void) => void;
    definitionSelector?: () => void;
    termData: TermData;
    vocabularyIri: string;

    language: string;
}

interface TermMetadataCreateFormState {
    generateUri: boolean;
    showAdvanced: boolean;
    labelExists: boolean;
}

export class TermMetadataCreateForm extends React.Component<TermMetadataCreateFormProps, TermMetadataCreateFormState> {

    constructor(props: TermMetadataCreateFormProps) {
        super(props);
        this.state = {
            generateUri: true,
            showAdvanced: false,
            labelExists: false
        };
    }

    public componentDidMount(): void {
        const label = this.props.termData.label;
        if (label) {
            this.resolveIdentifier(getLocalized(label));
        }
    }

    private onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const label = e.currentTarget.value;
        const change = Object.assign({}, this.props.termData.label);
        change[this.props.language] = label;
        this.props.onChange({label: change});
        this.resolveIdentifier(label);
        this.checkLabelUniqueness(label);
    };

    public onAltLabelsChange = (altLabels: string[]) => {
        const language = this.props.language;
        const change = {};
        change[language] = altLabels;
        this.props.onChange({altLabels: Object.assign({}, this.props.termData.altLabels, change)});
    };

    public onHiddenLabelsChange = (hiddenLabels: string[]) => {
        const language = this.props.language;
        const change = {};
        change[language] = hiddenLabels;
        this.props.onChange({hiddenLabels: Object.assign({}, this.props.termData.hiddenLabels, change)});
    };

    private checkLabelUniqueness(label: string) {
        this.setState({labelExists: false});
        if (label.trim().length === 0) {
            return;
        }
        const vocabularyIri = VocabularyUtils.create(this.props.vocabularyIri);
        const url = `${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/terms/name`;
        Ajax.get(url, params({namespace: vocabularyIri.namespace, value: label})).then((data) => {
            this.setState({labelExists: data === true});
        });
    }

    public onDefinitionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const value = e.currentTarget.value;
        const change = Object.assign({}, this.props.termData.definition);
        change[this.props.language] = value;
        this.props.onChange({definition: change});
    };

    private onCommentChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        this.props.onChange({comment: e.currentTarget.value});
    };

    private onIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setIdentifier(e.currentTarget.value, () => this.setState({generateUri: false}));
    };

    private resolveIdentifier = (label: string) => {
        if (this.state.generateUri && label.length > 0) {
            const vocabularyIri = VocabularyUtils.create(this.props.vocabularyIri);
            Ajax.get(`${Constants.API_PREFIX}/vocabularies/${vocabularyIri.fragment}/terms/identifier`,
                params({name: label, namespace: vocabularyIri.namespace})).then(uri => this.setIdentifier(uri));
        }
    };

    private setIdentifier = (newUri: string, callback: () => void = () => null) => {
        this.props.onChange({iri: newUri}, callback)
    };

    private toggleAdvancedSection = () => {
        this.setState({showAdvanced: !this.state.showAdvanced});
    };

    public onSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const source = e.currentTarget.value;
        this.props.onChange({sources: [source]});
    };

    public onTypeSelect = (types: string[]) => {
        this.props.onChange({types});
    };

    public onParentSelect = (parentTerms: Term[]) => {
        this.props.onChange({parentTerms});
    };

    public render() {
        const {termData, i18n, language} = this.props;
        const sources = termData.sources;
        const source = sources ? Utils.sanitizeArray(sources!).join() : undefined;
        const label = getLocalizedOrDefault(termData.label, "", language);
        return <Form>
            <Row>
                <Col xs={12}>
                    <CustomInput name="create-term-label" label={i18n("asset.label")}
                                 help={this.props.i18n("term.label.help")}
                                 onChange={this.onLabelChange}
                                 invalid={this.state.labelExists}
                                 invalidMessage={this.state.labelExists ? this.props.formatMessage("term.metadata.labelExists.message", {label}) : undefined}
                                 value={label}/>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <StringListEdit list={getLocalizedPlural(termData.altLabels, language)}
                                    onChange={this.onAltLabelsChange}
                                    i18nPrefix={"term.metadata.altLabels"}/>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    {this.props.definitionSelector ?
                        <FormGroup id="create-term-select-definition-group" style={{marginBottom: 0}}>
                            <Label className="attribute-label">{i18n("term.metadata.definition")}</Label>
                            <Button id="create-term-select-definition"
                                    color="muted"
                                    onClick={this.props.definitionSelector}
                                    size="sm" title={i18n("annotator.createTerm.selectDefinition.tooltip")}
                                    style={{float: "right"}}>
                                {i18n("annotator.createTerm.selectDefinition")}
                            </Button>
                        </FormGroup>
                        : <Label className="attribute-label">{i18n("term.metadata.definition")}</Label>}
                    <TextArea name="create-term-definition"
                              type="textarea" rows={3} value={getLocalizedOrDefault(termData.definition, "", language)}
                              help={this.props.i18n("term.definition.help")}
                              onChange={this.onDefinitionChange}/>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <TextArea name="create-term-comment" label={i18n("term.metadata.comment")}
                              type="textarea" rows={3} value={termData.comment}
                              help={this.props.i18n("term.comment.help")}
                              onChange={this.onCommentChange}/>
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <ParentTermSelector id="create-term-parent" onChange={this.onParentSelect}
                                        parentTerms={termData.parentTerms}
                                        vocabularyIri={this.props.vocabularyIri}/>
                </Col>
            </Row>

            <Button color="link" id="create-term-toggle-advanced" onClick={this.toggleAdvancedSection}>
                {this.state.showAdvanced ? i18n("glossary.form.button.hideAdvancedSection") : i18n("glossary.form.button.showAdvancedSection")}
            </Button>


            <Collapse isOpen={this.state.showAdvanced}>

                <Row>
                    <Col xs={12}>
                        <TermTypesEdit termTypes={Utils.sanitizeArray(termData.types)} onChange={this.onTypeSelect}/>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12}>
                        <CustomInput name="edit-term-source"
                                     value={source}
                                     onChange={this.onSourceChange}
                                     label={i18n("term.metadata.source")}
                                     help={i18n("term.source.help")}/>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12}>
                        <StringListEdit list={getLocalizedPlural(termData.hiddenLabels, language)}
                                        onChange={this.onHiddenLabelsChange}
                                        i18nPrefix={"term.metadata.hiddenLabels"}/>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12}>
                        <CustomInput name="create-term-iri" label={i18n("asset.iri")}
                                     help={this.props.i18n("term.iri.help")}
                                     onChange={this.onIdentifierChange}
                                     value={termData.iri}/>
                    </Col>
                </Row>
            </Collapse>
        </Form>;
    }
}

export default injectIntl(withI18n(TermMetadataCreateForm));
