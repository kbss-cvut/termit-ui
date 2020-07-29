import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Modal, ModalBody, ModalHeader} from "reactstrap";

interface FooterModalViewer extends HasI18n {
    show: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode
}

const FooterModalViewer: React.SFC<FooterModalViewer> = props => (
    <Modal size="lg" isOpen={props.show} toggle={props.onClose}>
        <ModalHeader toggle={props.onClose}>{props.i18n(props.title)}</ModalHeader>
        <ModalBody>
            {props.children}
        </ModalBody>
    </Modal>
);

export default injectIntl(withI18n(FooterModalViewer));
