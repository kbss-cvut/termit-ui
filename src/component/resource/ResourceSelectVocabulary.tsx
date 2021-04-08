import * as React from "react";
import {Button, ButtonToolbar, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import Vocabulary from "../../model/Vocabulary";
import VocabularySelect from "../vocabulary/VocabularySelect";
import {useSelector} from "react-redux";
import TermItState from "../../model/TermItState";
import {useI18n} from "../hook/useI18n";
import "./ResourceSelectVocabulary.scss";

interface ResourceSelectVocabularyProps {
    show: boolean;
    defaultVocabularyIri?: string;
    onSubmit: (voc: Vocabulary | null) => void;
    onCancel: () => void;
    title?: string;
}

function getVocabulary(
    selectedVocabulary: Vocabulary | null,
    vocabularies: {[key: string]: Vocabulary},
    defaultVocabularyIri?: string
) {
    return selectedVocabulary
        ? selectedVocabulary
        : defaultVocabularyIri
        ? vocabularies[defaultVocabularyIri] || null
        : null;
}

const ResourceSelectVocabulary: React.FC<ResourceSelectVocabularyProps> = props => {
    const {show, defaultVocabularyIri, onSubmit, onCancel, title} = props;
    const [selectedVocabulary, setSelectedVocabulary] = React.useState<Vocabulary | null>(null);
    const vocabularies = useSelector((state: TermItState) => state.vocabularies);
    const submit = () => onSubmit(getVocabulary(selectedVocabulary, vocabularies, defaultVocabularyIri));
    const cancel = () => {
        onCancel();
        setSelectedVocabulary(null);
    };
    const {i18n} = useI18n();

    return (
        <Modal isOpen={show} toggle={cancel} size="lg" className="resource-select-vocabulary-modal">
            <ModalHeader toggle={cancel}>{title ? title : i18n("vocabulary.select-vocabulary")}</ModalHeader>
            <ModalBody>
                <VocabularySelect
                    id="select-vocabulary-analyze-resource"
                    vocabulary={getVocabulary(selectedVocabulary, vocabularies, defaultVocabularyIri)}
                    onVocabularySet={setSelectedVocabulary}
                />
            </ModalBody>
            <ModalFooter>
                <ButtonToolbar className="pull-right">
                    <Button id="select-vocabulary-submit" color="primary" size="sm" onClick={submit}>
                        {i18n("file.metadata.startTextAnalysis.text")}
                    </Button>
                    <Button id="select-vocabulary-cancel" color="outline-dark" size="sm" onClick={cancel}>
                        {i18n("cancel")}
                    </Button>
                </ButtonToolbar>
            </ModalFooter>
        </Modal>
    );
};

export default ResourceSelectVocabulary;
