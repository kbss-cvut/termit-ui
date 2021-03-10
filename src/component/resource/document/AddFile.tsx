import * as React from "react";
import {useState} from "react";
import {Button, Card, CardBody, CardHeader, Modal, ModalBody} from "reactstrap";
import TermItFile from "../../../model/File";
import {GoPlus} from "react-icons/go";
import VocabularyUtils from "../../../util/VocabularyUtils";
import CreateFileMetadata from "../file/CreateFileMetadata";
import IfUserAuthorized from "../../authorization/IfUserAuthorized";
import {useI18n} from "../../hook/useI18n";

interface AddFileProps {
    performAction: (termitFile: TermItFile, file: File) => Promise<void>;
}

export const AddFile = (props: AddFileProps) => {
    const {i18n} = useI18n();
    const [createFileDialogOpen, setCreateFileDialogOpen] = useState(false);
    const toggle = () => setCreateFileDialogOpen(!createFileDialogOpen);

    const createFile = (termitFile: TermItFile, file: File) => {
        termitFile.addType(VocabularyUtils.FILE);
        return props.performAction(termitFile, file)
            .then(toggle)
    }

    return <IfUserAuthorized renderUnauthorizedAlert={false}>
        <Modal isOpen={createFileDialogOpen} toggle={toggle}>
            <ModalBody>
                <Card id="document-create-file">
                    <CardHeader color="info">
                        <h5>{i18n("resource.metadata.document.files.actions.add.dialog.title")}</h5>
                    </CardHeader>
                    <CardBody>
                        <CreateFileMetadata
                            onCreate={createFile}
                            onCancel={toggle}/>
                    </CardBody>
                </Card>
            </ModalBody>
        </Modal>
        <Button className="mb-2" color="primary" size="sm" onClick={toggle}
                title={i18n("resource.metadata.document.files.actions.add.tooltip")}>
            <GoPlus className="mr-1"/>{i18n("resource.metadata.document.files.actions.add")}
        </Button>
    </IfUserAuthorized>;
}

export default AddFile;