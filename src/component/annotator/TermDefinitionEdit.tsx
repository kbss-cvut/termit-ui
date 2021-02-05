import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Term, {TermData} from "../../model/Term";
import {Button, ButtonToolbar, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {getLocalized} from "../../model/MultilingualString";
import {getShortLocale} from "../../util/IntlUtil";
import TermDefinitionBlockEdit from "../term/TermDefinitionBlockEdit";
import {injectIntl} from "react-intl";
import {useSelector} from "react-redux";
import TermItState from "../../model/TermItState";
import HtmlDomUtils from "./HtmlDomUtils";
import {Element} from "domhandler";

interface TermDefinitionEditProps extends HasI18n {
    term?: Term;
    annotationElement?: Element;
    onSave: (update: Term) => void;
    onCancel: () => void;
}

const TermDefinitionEdit: React.FC<TermDefinitionEditProps> = props => {
    const {term, annotationElement, onSave, onCancel, i18n, formatMessage} = props;
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
    const onSaveClick = () => {
        onSave(data!);
    }
    if (!annotationElement || !data) {
        return null;
    }
    return <Modal id="annotator-set-term-definition" isOpen={true} toggle={onCancel}>
        <ModalHeader>
            {formatMessage("annotator.setTermDefinition.title", {term: getLocalized(data.label, getShortLocale(props.locale))})}
        </ModalHeader>
        <ModalBody>
            <TermDefinitionBlockEdit term={data} language={language} onChange={onChange}/>
        </ModalBody>
        <ModalFooter>
            <ButtonToolbar className="d-flex justify-content-center mt-4">
                <Button id="annotator-set-definition-save" color="success" size="sm"
                        onClick={onSaveClick}>{i18n("save")}</Button>
                <Button id="annotator-set-definition-cancel" color="outline-dark" size="sm"
                        onClick={onCancel}>{i18n("cancel")}</Button>
            </ButtonToolbar>
        </ModalFooter>
    </Modal>;
};

export default injectIntl(withI18n(TermDefinitionEdit));
