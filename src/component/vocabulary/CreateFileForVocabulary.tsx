import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Modal, ModalBody, ModalHeader} from "reactstrap";

import {injectIntl} from "react-intl";
import CreateFileMetadata from "../resource/file/CreateFileMetadataFull";
import Resource from "../../model/Resource";

export interface CreateFileForVocabularyProps extends HasI18n {
    isOpen: boolean,
    onCancel: () => void,
    onSubmit: (resource: Resource) => Promise<string>
}

const CreateFileForVocabulary = (props: CreateFileForVocabularyProps) => {
    return <Modal isOpen={props.isOpen} toggle={props.onCancel}>
        <ModalHeader toggle={props.onCancel}>{props.i18n("resource.file.vocabulary.create")}</ModalHeader>
        <ModalBody>
            <CreateFileMetadata
                onCancel={props.onCancel}
                onCreate={props.onSubmit}/>
        </ModalBody>
    </Modal>
}
export default (injectIntl(withI18n(CreateFileForVocabulary)))
