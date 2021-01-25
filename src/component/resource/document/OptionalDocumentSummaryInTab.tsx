import * as React from "react";
import Document from "../../../model/Document";
import DocumentSummaryInTab from "./DocumentSummaryInTab";
import {Button, Modal, ModalBody, ModalHeader} from "reactstrap";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {injectIntl} from "react-intl";
import DocumentList from "../DocumentList";
import {useState} from "react";
import VocabularyUtils, {IRI} from "../../../util/VocabularyUtils";
import Vocabulary from "../../../model/Vocabulary";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {
    loadResource,
    updateVocabulary,
} from "../../../action/AsyncActions";
import {GoX} from "react-icons/go";
import classNames from "classnames";

interface OptionalDocumentSummaryInTabProps extends HasI18n {
    vocabulary: Vocabulary;
    onChange: () => void;

    loadResource: (iri: IRI) => void;
    updateVocabulary: (vocabulary: Vocabulary) => Promise<any>;
}

export const OptionalDocumentSummaryInTab: React.FC<OptionalDocumentSummaryInTabProps> = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    if (props.vocabulary.document) {
        const onVocabularyDocumentRemove = () => {
            const document = props.vocabulary.document;
            delete props.vocabulary.document!.vocabulary;
            delete props.vocabulary.document;
            props.updateVocabulary(props.vocabulary).then(() =>
                props.loadResource(VocabularyUtils.create(document?.iri!))
            );
        };

        return <div className={classNames("card-header")}>
            <div/>
            <Button color="primary"
                    title={props.i18n("vocabulary.document.remove")}
                    size="sm"
                    style={{float:"right"}}
                    onClick={onVocabularyDocumentRemove}><GoX/> {props.i18n("vocabulary.document.remove")}
            </Button>
            &nbsp;
            <DocumentSummaryInTab resource={props.vocabulary.document} onChange={props.onChange}/>
        </div>;
    } else {
        const onVocabularyDocumentSet = (document: Document) => {
            props.vocabulary.document = document;
            // to avoid circular dependencies
            props.vocabulary.document.files.forEach( f => delete f.owner);
            return props.updateVocabulary(props.vocabulary).then(() =>
                props.loadResource(VocabularyUtils.create(document.iri!))
            );
        };

        const onSelected = (document: Document) => {
            return onVocabularyDocumentSet(document).then(toggle);
        }

        return <div className={classNames(
            "card-header", "d-flex", "justify-content-between")}>
            <div/>
            <Modal isOpen={isOpen} toggle={toggle}>
                <ModalHeader>
                    {props.i18n("vocabulary.document.select.title")}
                </ModalHeader>
                <ModalBody>
                    <DocumentList onSelected={onSelected}/>
                </ModalBody>
            </Modal>
            <Button color="primary"
                    title={props.i18n("vocabulary.document.select")}
                    size="sm"
                    onClick={toggle}>
                {props.i18n("vocabulary.document.select")}
            </Button>
        </div>;
    }
}

export default connect(() => {
    ;
}, (dispatch: ThunkDispatch) => {
    return {
        loadResource: (iri: IRI) => dispatch(loadResource(iri)),
        updateVocabulary: (vocabulary: Vocabulary) => dispatch(updateVocabulary(vocabulary)),
    };
})(injectIntl(withI18n(OptionalDocumentSummaryInTab)));