import React from "react";
import { UserData } from "../../../model/User";
import { useI18n } from "../../hook/useI18n";
import UserGroupEditForm from "./UserGroupEditForm";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import UserGroup from "../../../model/UserGroup";
import { trackPromise } from "react-promise-tracker";
import { createUserGroup } from "../../../action/AsyncUserGroupActions";
import HeaderWithActions from "../../misc/HeaderWithActions";
import { Button, ButtonToolbar, Card, CardBody, Col, Row } from "reactstrap";
import WindowTitle from "../../misc/WindowTitle";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";

const ROUTING_QUERY = new Map<string, string>([
  ["activeTab", "administration.groups"],
]);

const CreateUserGroup: React.FC = () => {
  const { i18n } = useI18n();
  const [label, setLabel] = React.useState("");
  const [members, setMembers] = React.useState<UserData[]>([]);
  const dispatch: ThunkDispatch = useDispatch();
  const onCreateGroup = () => {
    const group = new UserGroup({ label, members });
    trackPromise(dispatch(createUserGroup(group)), "create-group").then(() => {
      setLabel("");
      setMembers([]);
      Routing.transitionTo(Routes.administration, { query: ROUTING_QUERY });
    });
  };
  const onCancel = () => {
    Routing.transitionTo(Routes.administration, { query: ROUTING_QUERY });
  };

  return (
    <>
      <WindowTitle title={i18n("administration.groups.create")} />
      <HeaderWithActions title={i18n("administration.groups.create")} />
      <Card id="create-group" className="mb-3">
        <CardBody>
          <PromiseTrackingMask area="create-group" />
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
                  id="create-group-submit"
                  onClick={onCreateGroup}
                  color="success"
                  size="sm"
                  disabled={label.trim().length === 0}
                >
                  {i18n("create")}
                </Button>
                <Button
                  id="create-group-cancel"
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

export default CreateUserGroup;
