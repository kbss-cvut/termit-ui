import React from "react";
import { useI18n } from "../../hook/useI18n";
import { GoPlus } from "react-icons/go";
import PanelWithActions from "../../misc/PanelWithActions";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import UserGroup from "../../../model/UserGroup";
import {
  loadUserGroups,
  removeUserGroup,
} from "../../../action/AsyncUserGroupActions";
import { trackPromise } from "react-promise-tracker";
import { Link } from "react-router-dom";
import Routes from "../../../util/Routes";
import UserGroupsTable from "./UserGroupsTable";
import RemoveAssetDialog from "../../asset/RemoveAssetDialog";

const UserGroups: React.FC = () => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [groups, setGroups] = React.useState<UserGroup[]>([]);
  const [groupToDelete, setGroupToDelete] =
    React.useState<UserGroup | null>(null);
  React.useEffect(() => {
    trackPromise(dispatch(loadUserGroups()), "groups").then((data) =>
      setGroups(data)
    );
  }, [dispatch, setGroups]);
  const onDelete = () => {
    const g = groupToDelete;
    setGroupToDelete(null);
    trackPromise(dispatch(removeUserGroup(g!)), "groups").then(
      (data: UserGroup[]) => setGroups(data)
    );
  };

  return (
    <PanelWithActions
      id="groups"
      title={i18n("administration.groups")}
      actions={
        <Link
          id="administration-groups-create"
          title={i18n("administration.groups.create.tooltip")}
          to={Routes.createNewUserGroup.path}
          className="btn btn-primary btn-sm"
        >
          <GoPlus className="mr-1" />
          &nbsp;{i18n("administration.groups.create")}
        </Link>
      }
    >
      <PromiseTrackingMask area="groups" />
      <RemoveAssetDialog
        show={groupToDelete !== null}
        onSubmit={onDelete}
        onCancel={() => setGroupToDelete(null)}
        asset={groupToDelete}
        typeLabelId="administration.groups.remove.type"
      />
      <UserGroupsTable groups={groups} onDelete={(g) => setGroupToDelete(g)} />
    </PanelWithActions>
  );
};

export default UserGroups;
