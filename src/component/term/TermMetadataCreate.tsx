import * as React from "react";
import {Button, ButtonToolbar, Card, CardBody, Col, Row,} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import {RouteComponentProps, withRouter} from "react-router";
import Term, {TermData} from "../../model/Term";
import Utils from "../../util/Utils";
import {injectIntl} from "react-intl";
import TermMetadataCreateForm from "./TermMetadataCreateForm";
import AssetFactory from "../../util/AssetFactory";
import HeaderWithActions from "../misc/HeaderWithActions";
import {getLocalized} from "../../model/MultilingualString";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";
import EditLanguageSelector from "../multilingual/EditLanguageSelector";

interface TermMetadataCreateOwnProps {
    onCreate: (term: Term, newTerm: boolean) => void;
    vocabularyIri: string;
    language: string;
}

declare type TermMetadataCreateProps =
    TermMetadataCreateOwnProps
    & HasI18n
    & RouteComponentProps<any>;

interface CreateVocabularyTermState extends TermData {
    language: string;
}

export function isFormValid(data: TermData, locale?: string) {
    return getLocalized(data.label, locale).trim().length > 0 && data.iri && data.iri.trim().length > 0;
}

export class TermMetadataCreate extends React.Component<TermMetadataCreateProps, CreateVocabularyTermState> {

    constructor(props: TermMetadataCreateProps) {
        super(props);
        this.state = Object.assign(AssetFactory.createEmptyTermData(props.language), {language: props.language});
    }

    private cancelCreation = () => {
        const normalizedName = this.props.match.params.name;
        const namespace = Utils.extractQueryParam(this.props.location.search, "namespace");
        Routing.transitionTo(Routes.vocabularyDetail, {
            params: new Map([["name", normalizedName]]),
            query: namespace ? new Map([["namespace", namespace]]) : undefined
        });
    };

    private onSave = () => {
        const t = new Term(this.state);
        // @ts-ignore
        delete t.language;
        this.props.onCreate(t, false);
    };

    private onSaveAndGoToNewTerm = () => {
        const t = new Term(this.state);
        // @ts-ignore
        delete t.language;
        this.props.onCreate(new Term(t), true);
    };

    public onChange = (change: object, callback?: () => void) => {
        this.setState(change, callback);
    };

    public setLanguage = (language: string) => {
        this.setState({language});
    };

    public render() {
        const i18n = this.props.i18n;

        return <>
            <HeaderWithActions title={i18n("glossary.form.header")}/>
            <EditLanguageSelector language={this.state.language} onSelect={this.setLanguage} term={this.state}/>
            <Card id="create-term">
                <CardBody>
                    <TermMetadataCreateForm onChange={this.onChange} termData={this.state}
                                            language={this.state.language} vocabularyIri={this.props.vocabularyIri}/>
                    <Row>
                        <Col md={12}>
                            <ButtonToolbar className="d-flex justify-content-center mt-4">
                                <Button id="create-term-submit" color="success" onClick={this.onSave} size="sm"
                                        disabled={!isFormValid(this.state)}>{i18n("glossary.form.button.submit")}</Button>
                                <Button id="create-term-submit-and-go-to-new-term" color="success"
                                        onClick={this.onSaveAndGoToNewTerm} size="sm"
                                        disabled={!isFormValid(this.state, this.props.locale)}>{i18n("glossary.form.button.submitAndGoToNewTerm")}</Button>
                                <Button id="create-term-cancel" color="outline-dark" size="sm"
                                        onClick={this.cancelCreation}>{i18n("glossary.form.button.cancel")}</Button>
                            </ButtonToolbar>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </>;
    }
}

export default connect((state: TermItState) => ({language: state.configuration.language}))(withRouter(injectIntl(withI18n(TermMetadataCreate))));
