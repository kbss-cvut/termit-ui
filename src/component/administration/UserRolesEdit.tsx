import React from "react";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {Button, ButtonToolbar, Form, Modal, ModalBody, ModalHeader} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {UserRoleData} from "../../model/UserRole";
import {getLocalized} from "../../model/MultilingualString";
import Select from "../misc/Select";
import {filterActualRoles} from "./UserRoles";
import User from "../../model/User";
import TermItState from "../../model/TermItState";

interface UserRolesEditProps extends HasI18n {
    user: User,
    open: boolean,
    availableRoles: UserRoleData[],
    onCancel: () => void,
    onSubmit: (role: UserRoleData) => void;
}

const UserRolesEdit = (props: UserRolesEditProps) => {
    const {i18n, locale, user, open, availableRoles, onCancel, onSubmit} = props;
    const [role, setRole] = React.useState<string>();

    React.useEffect(() => {
        if (user != null) {
            setRole(filterActualRoles(user.types, availableRoles).map(r => r.iri)[0]);
        }
    }, [user, availableRoles]);
    if (!open || user === null) {
        return null;
    }
    const options = availableRoles.map((r: UserRoleData) =>
        <option key={r.iri} value={r.iri} label={getLocalized(r.label, locale)}>{getLocalized(r.label, locale)}</option>
    );

    const save = () => onSubmit(availableRoles.find((r: UserRoleData) => r.iri === role)!);

    const roleObject = availableRoles.find((r: UserRoleData) => r.iri === role)!;

    const value = (role !== undefined) ? roleObject.iri : undefined;
    const description = (role !== undefined) ? getLocalized(roleObject.description, locale) : undefined;
    return <><Modal id="administration.users.roles.edit" isOpen={true} toggle={props.onCancel} size="lg">
        <ModalHeader toggle={props.onCancel}>{props.formatMessage("administration.users.roles.edit.title", {
            name: user.fullName,
        })}</ModalHeader>
        <ModalBody>
            <Form>
                <Select
                    value={value}
                    onChange={(e: any) => setRole(e.target.value)}
                    placeholder={i18n("select.placeholder")}
                    help={description}>
                    {options}
                </Select>
                <ButtonToolbar className="float-right">
                    <Button variant="success" className="users-action-button" size="sm"
                            onClick={save}>{i18n("save")}</Button>
                    <Button variant="outline-primary" className="users-action-button" size="sm"
                            onClick={onCancel}>{i18n("cancel")}</Button>
                </ButtonToolbar>
            </Form>
        </ModalBody>
    </Modal></>;
}

export default connect((state: TermItState) => ({availableRoles: state.configuration.roles}))(injectIntl(withI18n(UserRolesEdit)));
