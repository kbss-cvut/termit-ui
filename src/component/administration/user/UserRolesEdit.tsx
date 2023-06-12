import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  ButtonToolbar,
  Form,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import { UserRoleData } from "../../../model/UserRole";
import { getLocalized } from "../../../model/MultilingualString";
import Select from "../../misc/Select";
import { filterActualRoles } from "./UserRoles";
import User from "../../../model/User";
import TermItState from "../../../model/TermItState";
import { useI18n } from "../../hook/useI18n";
import Utils from "../../../util/Utils";
import VocabularyUtils from "../../../util/VocabularyUtils";
import RdfsResource from "../../../model/RdfsResource";
import { ThunkDispatch } from "../../../util/Types";
import { loadManagedAssets } from "../../../action/AsyncUserActions";
import ManagedAssets from "./ManagedAssets";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";

interface UserRolesEditProps {
  user: User;
  open: boolean;
  onCancel: () => void;
  onSubmit: (role: UserRoleData) => void;
}

const UserRolesEdit = (props: UserRolesEditProps) => {
  const { user, open, onCancel, onSubmit } = props;
  const { i18n, formatMessage, locale } = useI18n();
  const [role, setRole] = useState<string>(VocabularyUtils.USER_RESTRICTED);
  const availableRoles = useSelector(
    (state: TermItState) => state.configuration.roles
  );
  const [managedAssets, setManagedAssets] = useState<RdfsResource[]>([]);
  const dispatch: ThunkDispatch = useDispatch();

  useEffect(() => {
    setManagedAssets([]);
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

  const onRoleSelect = (role: string) => {
    setRole(role);
    if (role === VocabularyUtils.USER_RESTRICTED) {
      trackPromise(dispatch(loadManagedAssets(user)), "role-edit").then(
        (assets) => setManagedAssets(assets)
      );
    } else {
      setManagedAssets([]);
    }
  };

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
          <PromiseTrackingMask area="role-edit" />
          <Form>
            <Select
              value={roleObject.iri}
              onChange={(e: any) => onRoleSelect(e.target.value)}
              placeholder={i18n("select.placeholder")}
              help={description}
            >
              {options}
            </Select>
            <ManagedAssets managedAssets={managedAssets} />
            <ButtonToolbar className="float-right">
              <Button
                id="role-edit-submit"
                color="success"
                className="users-action-button"
                size="sm"
                disabled={!role || managedAssets.length > 0}
                onClick={save}
              >
                {i18n("save")}
              </Button>
              <Button
                id="role-edit-cancel"
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

export default UserRolesEdit;
