import React from "react";
import { useI18n } from "../../hook/useI18n";
import { UserData } from "../../../model/User";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import Routes from "../../../util/Routes";
import WindowTitle from "../../misc/WindowTitle";
import HeaderWithActions from "../../misc/HeaderWithActions";
import { Button, ButtonToolbar, Card, CardBody, Col, Row } from "reactstrap";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import UserGroupEditForm from "./UserGroupEditForm";
import Routing from "../../../util/Routing";
import UserGroup from "../../../model/UserGroup";
import { useLocation, useParams } from "react-router-dom";
import Utils from "../../../util/Utils";
import {
  addGroupMembers,
  loadUserGroup,
  removeGroupMembers,
  updateUserGroupLabel,
} from "../../../action/AsyncUserGroupActions";
import { trackPromise } from "react-promise-tracker";
import { publishMessage } from "../../../action/SyncActions";
import Message from "../../../model/Message";
import MessageType from "../../../model/MessageType";

const ROUTING_QUERY = new Map<string, string>([
  ["activeTab", "administration.groups"],
]);

function resolveMembersDiff(
  originalMembers: UserData[],
  newMembers: UserData[]
) {
  const toAdd: string[] = [];
  const originalIris = new Set(originalMembers.map((m) => m.iri));
  const newIris = new Set(newMembers.map((m) => m.iri));
  newIris.forEach((iri) => {
    if (!originalIris.has(iri)) {
      toAdd.push(iri);
    } else {
      originalIris.delete(iri);
    }
  });
  const toRemove = Array.from(originalIris);
  return { toAdd, toRemove };
}

const EditUserGroup: React.FC = () => {
  const { i18n } = useI18n();
  const [group, setGroup] = React.useState<UserGroup>();
  const { name } = useParams<any>();
  const location = useLocation();
  const [label, setLabel] = React.useState("");
  const [members, setMembers] = React.useState<UserData[]>([]);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    const namespace = Utils.extractQueryParam(location.search, "namespace");
    trackPromise(
      dispatch(loadUserGroup({ fragment: name, namespace })),
      "update-group"
    ).then((g) => {
      if (g) {
        setGroup(g);
        setLabel(g.label);
        setMembers(g.members);
      }
    });
  }, [dispatch, location, name, setGroup]);
  const onUpdateGroup = () => {
    const { toAdd, toRemove } = resolveMembersDiff(group!.members, members);
    trackPromise(
      new Promise<void>(async (resolve) => {
        // Execute group editing requests sequentially to prevent concurrency issues
        if (group!.label !== label) {
          await dispatch(
            updateUserGroupLabel(new UserGroup({ iri: group!.iri, label }))
          );
        }
        if (toAdd.length > 0) {
          await dispatch(addGroupMembers(group!, toAdd));
        }
        if (toRemove.length > 0) {
          await dispatch(removeGroupMembers(group!, toRemove));
        }
        resolve();
      }),
      "update-group"
    ).then(() => {
      dispatch(
        publishMessage(
          new Message(
            { messageId: "administration.groups.update.success" },
            MessageType.SUCCESS
          )
        )
      );
      Routing.transitionTo(Routes.administration, { query: ROUTING_QUERY });
    });
  };
  const onCancel = () => {
    Routing.transitionTo(Routes.administration, { query: ROUTING_QUERY });
  };

  return (
    <>
      <WindowTitle title={i18n("administration.groups.update")} />
      <HeaderWithActions title={i18n("administration.groups.update")} />
      <Card id="create-group" className="mb-3">
        <CardBody>
          <PromiseTrackingMask area="update-group" />
          <UserGroupEditForm
            label={label}
            members={members}
            onLabelChange={setLabel}
            onMembersChange={setMembers}
          />
          <Row>
            <Col xs={12}>
              <ButtonToolbar className="d-flex justify-content-center mt-4">
                <Button
                  id="update-group-submit"
                  onClick={onUpdateGroup}
                  color="success"
                  size="sm"
                  disabled={label.trim().length === 0}
                >
                  {i18n("save")}
                </Button>
                <Button
                  id="update-group-cancel"
                  onClick={onCancel}
                  color="outline-dark"
                  size="sm"
                >
                  {i18n("cancel")}
                </Button>
              </ButtonToolbar>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
};

export default EditUserGroup;
