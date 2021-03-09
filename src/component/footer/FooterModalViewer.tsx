import * as React from "react";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import {useI18n} from "../hook/useI18n";

interface FooterModalViewerProps {
    show: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode
}

const FooterModalViewer: React.FC<FooterModalViewerProps> = props => {
    const {i18n} = useI18n();
    return <Modal size="lg" isOpen={props.show} toggle={props.onClose}>
        <ModalHeader toggle={props.onClose}>{i18n(props.title)}</ModalHeader>
        <ModalBody>
            {props.children}
        </ModalBody>
    </Modal>;
};

export default FooterModalViewer;
