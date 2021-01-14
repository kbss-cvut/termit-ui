import * as React from "react";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {
    Button,
    ButtonToolbar,
    Card,
    CardBody,
    CardHeader,
    Col,
    Modal,
    ModalBody,
    Row
} from "reactstrap";
import {GoX} from "react-icons/go";
import {injectIntl} from "react-intl";
import {useState} from "react";

interface RemoveFileProps extends HasI18n {
    performAction: () => Promise<void>;
    withConfirmation: boolean;
}

export const RemoveFile = (props: RemoveFileProps) => {

    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const toggle = () => setConfirmationDialogOpen(!confirmationDialogOpen);

    const performAction = () => {
        props.performAction()
            .then(toggle)
    };

    return <>
        <Modal isOpen={confirmationDialogOpen} toggle={toggle}>
            <ModalBody>
                <Card id={"resource.metadata.document.files.actions.remove"}>
                    <CardHeader color="info">
                        <h5>{props.i18n("resource.metadata.document.files.actions.remove.dialog.title")}</h5>
                    </CardHeader>
                    <CardBody>
                        <Row>
                            <Col xs={12}>
                                <ButtonToolbar className="d-flex justify-content-center mt-4">
                                    <Button id="create-resource-submit" onClick={performAction} color="danger"
                                            size="sm">{props.i18n("remove")}</Button>
                                    <Button id="create-resource-cancel" onClick={toggle}
                                            color="outline-dark" size="sm">{props.i18n("cancel")}</Button>
                                </ButtonToolbar>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </ModalBody>
        </Modal>
        <Button className="mb-2" color="primary" size="sm" onClick={props.withConfirmation ? toggle : performAction}
                title={props.i18n("resource.metadata.document.files.actions.remove.tooltip")}>
            <GoX/>&nbsp;{props.i18n("resource.metadata.document.files.actions.remove")}
        </Button>
    </>;
}

export default injectIntl(withI18n(RemoveFile));