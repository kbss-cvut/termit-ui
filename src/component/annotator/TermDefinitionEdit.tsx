import * as React from "react";
import Term, {TermData} from "../../model/Term";
import {Button, ButtonToolbar, Col, Form, Modal, ModalBody, ModalHeader, Row} from "reactstrap";
import {getLocalized} from "../../model/MultilingualString";
import {getShortLocale} from "../../util/IntlUtil";
import TermDefinitionBlockEdit from "../term/TermDefinitionBlockEdit";
import {useSelector} from "react-redux";
import TermItState from "../../model/TermItState";
import HtmlDomUtils from "./HtmlDomUtils";
import {Element} from "domhandler";
import "./TermDefinitionEdit.scss";
import classNames from "classnames";
import {useI18n} from "../hook/useI18n";

interface TermDefinitionEditProps {
    term?: Term;
    annotationElement?: Element;
    onSave: (update: Term) => void;
    onCancel: () => void;
}

function hasExistingDefinition(term: Term, language: string) {
    return term.definition && term.definition[language];
}

export const TermDefinitionEdit: React.FC<TermDefinitionEditProps> = props => {
    const {term, annotationElement, onSave, onCancel} = props;
    const {i18n, formatMessage, locale} = useI18n();
    const language = useSelector((state: TermItState) => state.configuration.language);
    const onChange = (change: Partial<TermData>) => setData(new Term(Object.assign({}, data, change)));
    const [data, setData] = React.useState<Term>();
    React.useEffect(() => {
        if (term && annotationElement) {
            const definition = {};
            definition[language] = HtmlDomUtils.getTextContent(annotationElement!);
            setData(new Term(Object.assign({}, term, {definition})));
        }
    }, [term, language, annotationElement]);
    if (!annotationElement || !data) {
        return null;
    }
    const hasExisting = hasExistingDefinition(term!, language);

    return (
        <Modal
            id="annotator-set-term-definition"
            isOpen={true}
            toggle={onCancel}
            size="lg"
            className={classNames({wide: hasExisting})}>
            <ModalHeader>
                {formatMessage("annotator.setTermDefinition.title", {
                    term: getLocalized(data.label, getShortLocale(locale))
                })}
            </ModalHeader>
            <ModalBody>
                <Form>
                    {hasExisting ? (
                        <>
                            <Row>
                                <Col xs={12}>
                                    <p>
                                        {formatMessage("annotation.definition.exists.message", {
                                            term: getLocalized(term!.label, getShortLocale(locale))
                                        })}
                                    </p>
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6}>
                                    <h4>{i18n("annotation.definition.original")}</h4>
                                    <TermDefinitionBlockEdit
                                        term={term!}
                                        language={language}
                                        onChange={onChange}
                                        readOnly={true}
                                    />
                                </Col>
                                <Col xs={6}>
                                    <h4>{i18n("annotation.definition.new")}</h4>
                                    <TermDefinitionBlockEdit term={data} language={language} onChange={onChange} />
                                </Col>
                            </Row>
                        </>
                    ) : (
                        <TermDefinitionBlockEdit term={data} language={language} onChange={onChange} />
                    )}

                    <Row>
                        <Col xs={12}>
                            <ButtonToolbar className="d-flex justify-content-center mt-4">
                                <Button
                                    id="annotator-set-definition-save"
                                    color="success"
                                    size="sm"
                                    onClick={() => onSave(data!)}>
                                    {i18n("save")}
                                </Button>
                                <Button
                                    id="annotator-set-definition-cancel"
                                    color="outline-dark"
                                    size="sm"
                                    onClick={onCancel}>
                                    {i18n("cancel")}
                                </Button>
                            </ButtonToolbar>
                        </Col>
                    </Row>
                </Form>
            </ModalBody>
        </Modal>
    );
};

export default TermDefinitionEdit;
