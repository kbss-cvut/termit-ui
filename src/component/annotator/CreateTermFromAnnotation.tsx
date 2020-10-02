import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TermData} from "../../model/Term";
import {
    Button,
    ButtonToolbar,
    Col,
    Modal,
    ModalBody,
    ModalHeader,
    Row
} from "reactstrap";
import TermMetadataCreateForm from "../term/TermMetadataCreateForm";
import {isFormValid} from "../term/TermMetadataCreate";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {ThunkDispatch} from "../../util/Types";
import {createTerm} from "../../action/AsyncActions";
import {IRI} from "../../util/VocabularyUtils";
import AssetFactory from "../../util/AssetFactory";
import {langString} from "../../model/MultilingualString";
import Constants from "../../util/Constants";

interface CreateTermFromAnnotationProps extends HasI18n {
    show: boolean;
    onClose: () => void;
    onMinimize: () => void; // Minimize will be used to allow the user to select definition for a term being created
    onTermCreated: (term: Term) => void;
    vocabularyIri: IRI;

    createTerm: (term: Term, vocabularyIri: IRI) => Promise<any>;
}

interface CreateTermFromAnnotationState extends TermData {
}

export class CreateTermFromAnnotation extends React.Component<CreateTermFromAnnotationProps, CreateTermFromAnnotationState> {

    constructor(props: CreateTermFromAnnotationProps) {
        super(props);
        this.state = AssetFactory.createEmptyTermData();
    }

    /**
     * Part of public imperative API allowing to set label so that the whole term does not have to be kept in parent
     * component state.
     */
    public setLabel(label: string) {
        this.setState({label: langString(label, Constants.DEFAULT_LANGUAGE)});
    }

    /**
     * Part of public imperative API allowing to set definition so that the whole term does not have to be kept in
     * parent component state.
     */
    public setDefinition(definition: string) {
        this.setState({definition});
    }

    public onChange = (change: object, callback?: () => void) => {
        this.setState(change, callback)
    };

    public onSave = () => {
        const newTerm = new Term(this.state);
        this.props.createTerm(newTerm, this.props.vocabularyIri).then(() => {
            this.props.onTermCreated(newTerm);
            this.onCancel();
        });
    };

    public onCancel = () => {
        this.setState(AssetFactory.createEmptyTermData());
        this.props.onClose();
    };

    public render() {
        const i18n = this.props.i18n;
        return <Modal id="annotator-create-term" isOpen={this.props.show} toggle={this.onCancel}>
            <ModalHeader>
                {i18n("glossary.form.header")}
            </ModalHeader>
            <ModalBody>
                <TermMetadataCreateForm onChange={this.onChange}
                                        termData={this.state}
                                        definitionSelector={this.props.onMinimize}
                                        vocabularyIri={this.props.vocabularyIri.namespace + this.props.vocabularyIri.fragment}/>
                <Row>
                    <Col xs={12}>
                        <ButtonToolbar className="d-flex justify-content-center mt-4">
                            <Button id="create-term-submit" color="success" onClick={this.onSave}
                                    disabled={!isFormValid(this.state)}
                                    size="sm">{i18n("glossary.form.button.submit")}</Button>
                            <Button id="create-term-cancel" color="outline-dark" size="sm"
                                    onClick={this.onCancel}>{i18n("glossary.form.button.cancel")}</Button>
                        </ButtonToolbar>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>;
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        createTerm: (term: Term, vocabularyIri: IRI) => dispatch(createTerm(term, vocabularyIri))
    };
}, undefined, {forwardRef: true})(injectIntl(withI18n(CreateTermFromAnnotation, {forwardRef: true}), {forwardRef: true}));



