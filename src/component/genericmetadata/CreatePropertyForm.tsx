import * as React from "react";
import {injectIntl} from "react-intl";
import {RdfsResourceData} from "../../model/RdfsResource";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Button, ButtonToolbar, Col, ModalBody, ModalHeader, Row} from "reactstrap";
import CustomInput from "../misc/CustomInput";
import VocabularyUtils from "../../util/VocabularyUtils";

interface CreatePropertyFormProps extends HasI18n {
    onOptionCreate: (option: RdfsResourceData) => void;
    toggleModal: () => void;
}

interface CreatePropertyFormState {
    iri: string;
    label: string;
    comment: string;
}

export class CreatePropertyForm extends React.Component<CreatePropertyFormProps, CreatePropertyFormState> {
    constructor(props: CreatePropertyFormProps) {
        super(props);
        this.state = {
            iri: "",
            label: "",
            comment: ""
        };
    }

    private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const change = {};
        change[e.currentTarget.name] = e.currentTarget.value;
        this.setState(change);
    };

    public onCreate = () => {
        this.props.toggleModal();
        const newProperty: RdfsResourceData = {
            iri: this.state.iri,
            label: this.state.label.length > 0 ? this.state.label : undefined,
            comment: this.state.comment.length > 0 ? this.state.comment : undefined,
            types: [VocabularyUtils.RDF_PROPERTY]
        };
        this.props.onOptionCreate(newProperty);
    };

    private isValid() {
        // "http://".length => 7
        return this.state.iri.length > 7;
    }

    public render() {
        const i18n = this.props.i18n;
        return <div>
            <ModalHeader toggle={this.props.toggleModal}>
                {i18n("properties.edit.new")}
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col xs={12}>
                        <CustomInput name="iri" label={i18n("properties.edit.new.iri")} onChange={this.onChange}/>
                    </Col>
                    <Col xs={12}>
                        <CustomInput name="label" label={i18n("properties.edit.new.label")} onChange={this.onChange}/>
                    </Col>
                    <Col xs={12}>
                        <CustomInput type="textarea" name="comment" label={i18n("properties.edit.new.comment")}
                                     onChange={this.onChange} help={i18n("optional")}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <ButtonToolbar className="float-right">
                            <Button color="success" size="sm" onClick={this.onCreate}
                                    disabled={!this.isValid()}>{i18n("save")}</Button>
                            <Button size="sm" onClick={this.props.toggleModal}>{i18n("cancel")}</Button>
                        </ButtonToolbar>
                    </Col>
                </Row>
            </ModalBody>
        </div>;
    }
}

export default injectIntl(withI18n(CreatePropertyForm));