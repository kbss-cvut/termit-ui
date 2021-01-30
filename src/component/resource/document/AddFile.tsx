import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {Button, Card, CardBody, CardHeader, Modal, ModalBody} from "reactstrap";
import TermItFile from "../../../model/File";
import {GoPlus} from "react-icons/go";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Resource from "../../../model/Resource";
import CreateFileMetadata from "../file/CreateFileMetadata";
import {useState} from "react";

interface AddFileProps extends HasI18n {
    performAction: (termitFile: TermItFile, file: File) => Promise<void>;
}

export const AddFile = (props: AddFileProps) => {

    const [createFileDialogOpen, setCreateFileDialogOpen] = useState(false);
    const toggle = () => setCreateFileDialogOpen(!createFileDialogOpen);

    const createFile = (termitFile: Resource, file: File) => {
        termitFile.addType(VocabularyUtils.FILE);
        return props.performAction(termitFile as TermItFile, file)
            .then(toggle)
    }

    return <>
        <Modal isOpen={createFileDialogOpen} toggle={toggle}>
            <ModalBody>
                <Card id="document-create-file">
                    <CardHeader color="info">
                        <h5>{props.i18n("resource.metadata.document.files.actions.add.dialog.title")}</h5>
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
                title={props.i18n("resource.metadata.document.files.actions.add.tooltip")}>
            <GoPlus/>&nbsp;{props.i18n("resource.metadata.document.files.actions.add")}
        </Button>
    </>
}

export default injectIntl(withI18n(AddFile));