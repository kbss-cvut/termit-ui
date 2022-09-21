import { useState, useEffect } from "react";
import { connect } from "react-redux";
import {
  Button,
  ButtonToolbar,
  Form,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import UserRole, { UserRoleData } from "../../model/UserRole";
import { getLocalized } from "../../model/MultilingualString";
import Select from "../misc/Select";
import { filterActualRoles } from "./UserRoles";
import User from "../../model/User";
import TermItState from "../../model/TermItState";
import { useI18n } from "../hook/useI18n";
import Utils from "../../util/Utils";
import VocabularyUtils from "../../util/VocabularyUtils";

interface UserRolesEditProps {
  user: User;
  open: boolean;
  availableRoles: UserRole[];
  onCancel: () => void;
  onSubmit: (role: UserRoleData) => void;
}

const UserRolesEdit = (props: UserRolesEditProps) => {
  const { user, open, availableRoles, onCancel, onSubmit } = props;
  const { i18n, formatMessage, locale } = useI18n();
  const [role, setRole] = useState<string>(VocabularyUtils.USER_RESTRICTED);

  useEffect(() => {
    if (user != null) {
      const actualRoles = filterActualRoles(user.types, availableRoles).map(
        (r) => r.iri
      );
      setRole(
        actualRoles.length > 0
          ? actualRoles[0]
          : VocabularyUtils.USER_RESTRICTED
      );
    }
  }, [user, availableRoles]);
  if (!open || user === null) {
    return null;
  }
  availableRoles.sort(Utils.labelComparator);
  const options = availableRoles.map((r: UserRoleData) => (
    <option key={r.iri} value={r.iri} label={getLocalized(r.label, locale)}>
      {getLocalized(r.label, locale)}
    </option>
  ));

  const save = () =>
    onSubmit(availableRoles.find((r: UserRoleData) => r.iri === role)!);

  const roleObject = availableRoles.find((r: UserRoleData) => r.iri === role)!;

  const description =
    role !== undefined
      ? getLocalized(roleObject.description, locale)
      : undefined;
  return (
    <>
      <Modal
        id="administration.users.roles.edit"
        isOpen={true}
        toggle={props.onCancel}
        size="lg"
      >
        <ModalHeader toggle={props.onCancel}>
          {formatMessage("administration.users.roles.edit.title", {
            name: user.fullName,
          })}
        </ModalHeader>
        <ModalBody>
          <Form>
            <Select
              value={roleObject.iri}
              onChange={(e: any) => setRole(e.target.value)}
              placeholder={i18n("select.placeholder")}
              help={description}
            >
              {options}
            </Select>
            <ButtonToolbar className="float-right">
              <Button
                color="success"
                className="users-action-button"
                size="sm"
                disabled={!role}
                onClick={save}
              >
                {i18n("save")}
              </Button>
              <Button
                color="outline-dark"
                className="users-action-button"
                size="sm"
                onClick={onCancel}
              >
                {i18n("cancel")}
              </Button>
            </ButtonToolbar>
          </Form>
        </ModalBody>
      </Modal>
    </>
  );
};

export default connect((state: TermItState) => ({
  availableRoles: state.configuration.roles,
}))(UserRolesEdit);
