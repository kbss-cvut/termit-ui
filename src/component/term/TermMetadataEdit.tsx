import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar, Card, CardBody, Col, Form, Row} from "reactstrap";
import Term, {CONTEXT, TermData} from "../../model/Term";
import "./TermMetadata.scss";
import CustomInput from "../misc/CustomInput";
import TextArea from "../misc/TextArea";
import Ajax, {params} from "../../util/Ajax";
import Constants from "../../util/Constants";
import VocabularyUtils from "../../util/VocabularyUtils";
import TermTypesEdit from "./TermTypesEdit";
import Utils from "../../util/Utils";
import UnmappedPropertiesEdit from "../genericmetadata/UnmappedPropertiesEdit";
import ParentTermSelector from "./ParentTermSelector";
import DraftToggle from "./DraftToggle";
import StringListEdit from "../misc/StringListEdit";

interface TermMetadataEditProps extends HasI18n {
    term: Term,
    save: (term: Term) => void;
    cancel: () => void;
}

interface TermMetadataEditState extends TermData {
    labelExists: boolean;
    unmappedProperties: Map<string, string[]>;
}

export class TermMetadataEdit extends React.Component<TermMetadataEditProps, TermMetadataEditState> {
    constructor(props: TermMetadataEditProps) {
        super(props);
        this.state = Object.assign({labelExists: false, unmappedProperties: props.term.unmappedProperties}, props.term);
    }

    public onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const change = {};
        change[e.currentTarget.name.substring(e.currentTarget.name.lastIndexOf("-") + 1)] = e.currentTarget.value;
        this.setState(change);
    };

    public onLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const label = e.currentTarget.value;
        this.setState({labelExists: false, label});
        if (label.toLowerCase() === this.props.term.label.toLowerCase()) {
            return;
        }
        const vocabIri = VocabularyUtils.create(this.props.term.vocabulary!.iri!);
        const url = Constants.API_PREFIX + "/vocabularies/" + vocabIri.fragment + "/terms/name";
        Ajax.get(url, params({namespace: vocabIri.namespace, value: label})).then((data) => {
            this.setState({labelExists: data === true});
        });
    };

    private onSourceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const source = e.currentTarget.value;
        this.setState({sources: [source]});
    };

    private onHiddenLabelsChange = (hiddenLabels: string[]) => {
        this.setState({hiddenLabels});
    };

    private onAltLabelsChange = (altLabels: string[]) => {
        this.setState({altLabels});
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
        const {labelExists, unmappedProperties, ...data} = this.state;
        const t = new Term(data);
        t.unmappedProperties = this.state.unmappedProperties;
        this.props.save(t);
    };

    private isValid(): boolean {
        return this.state.iri!.length > 0 && this.state.label.length > 0 && !this.state.labelExists;
    }

    public render() {
        const i18n = this.props.i18n;
        const t = this.onStatusChange.bind(this);
        const sources = this.state.sources;
        const source = sources ? Utils.sanitizeArray(sources!).join() : undefined;
        return <Card>
            <CardBody>
                <Form>
                    <Row>
                        <Col xs={12}>
                            <CustomInput name="edit-term-label" value={this.state.label} onChange={this.onLabelChange}
                                         label={i18n("asset.label")} invalid={this.state.labelExists}
                                         invalidMessage={this.state.labelExists ? this.props.formatMessage("term.metadata.labelExists.message", {label: this.state.label}) : undefined}
                                         help={i18n("term.label.help")}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <StringListEdit list={this.state.altLabels}
                                            onChange={this.onAltLabelsChange}
                                            i18nPrefix={"term.metadata.altLabels"}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <StringListEdit list={this.state.hiddenLabels}
                                            onChange={this.onHiddenLabelsChange}
                                            i18nPrefix={"term.metadata.hiddenLabels"}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <TextArea name="edit-term-definition" value={this.state.definition}
                                      onChange={this.onInputChange} rows={3} label={i18n("term.metadata.definition")}
                                      help={i18n("term.definition.help")}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <TextArea name="edit-term-comment" value={this.state.comment}
                                      onChange={this.onInputChange} rows={3} label={i18n("term.metadata.comment")}
                                      help={i18n("term.comment.help")}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <ParentTermSelector id="edit-term-parent" termIri={this.props.term.iri}
                                                parentTerms={this.state.parentTerms}
                                                vocabularyIri={this.props.term.vocabulary!.iri!}
                                                onChange={this.onParentChange}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={12}>
                            <TermTypesEdit termTypes={Utils.sanitizeArray(this.state.types)}
                                           onChange={this.onTypesChange}/>
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
                            <CustomInput name="edit-term-source" value={source} onChange={this.onSourceChange}
                                         label={i18n("term.metadata.source")}
                                         invalidMessage={(this.state.sources && (this.state.sources.length > 1))
                                             ? i18n("term.metadata.multipleSources.message") : undefined}
                                         help={i18n("term.source.help")}/>
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
                                <Button id="edit-term-submit" color={Constants.SUBMIT_BUTTON_VARIANT} disabled={!this.isValid()} size="sm"
                                        onClick={this.onSave}>{i18n("save")}</Button>
                                <Button id="edit-term-cancel" color={Constants.CANCEL_BUTTON_VARIANT} size="sm"
                                        onClick={this.props.cancel}>{i18n("cancel")}</Button>
                            </ButtonToolbar>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>;
    }

    private static mappedPropertiesToIgnore() {
        const toIgnore = Object.getOwnPropertyNames(CONTEXT).map(n => CONTEXT[n]);
        toIgnore.push(VocabularyUtils.RDF_TYPE);
        return toIgnore;
    }
}

export default injectIntl(withI18n(TermMetadataEdit));
