import React from "react";
import User, { UserData } from "../../../model/User";
import { useSelector } from "react-redux";
import TermItState from "../../../model/TermItState";
import { Col, Input, Label, Row } from "reactstrap";
import { useI18n } from "../../hook/useI18n";

const COLUMN_COUNT = 3;
const COLUMN_WIDTH = 12 / COLUMN_COUNT;

const UserGroupSelector: React.FC<{
  members: UserData[];
  onChange: (members: UserData[]) => void;
}> = ({ members, onChange }) => {
  const { i18n } = useI18n();
  const memberIds = new Set(members.map((m) => m.iri));
  const allUsers = useSelector((state: TermItState) => state.users);
  const onToggle = (user: User) => {
    const newMembers = [...members];
    if (memberIds.has(user.iri)) {
      newMembers.splice(
        newMembers.findIndex((e) => e.iri === user.iri),
        1
      );
    } else {
      newMembers.push(user);
    }
    onChange(newMembers);
  };

  const rowCount = allUsers.length / COLUMN_COUNT;
  const rows = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push(
      <Row key={i}>
        <Col xs={COLUMN_WIDTH}>
          <UserCheckbox
            user={allUsers[i]}
            checked={memberIds.has(allUsers[i].iri)}
            onChange={() => onToggle(allUsers[i])}
          />
        </Col>
        <Col xs={COLUMN_WIDTH}>
          <UserCheckbox
            user={allUsers[i + rowCount]}
            checked={memberIds.has(allUsers[i + rowCount].iri)}
            onChange={() => onToggle(allUsers[i + rowCount])}
          />
        </Col>
        {allUsers.length > i + 2 * rowCount && (
          <Col xs={COLUMN_WIDTH}>
            <UserCheckbox
              user={allUsers[i + 2 * rowCount]}
              checked={memberIds.has(allUsers[i + 2 * rowCount].iri)}
              onChange={() => onToggle(allUsers[i + 2 * rowCount])}
            />
          </Col>
        )}
      </Row>
    );
  }
  return (
    <>
      <Label className="attribute-label">
        {i18n("administration.groups.members")}
      </Label>
      {rows}
    </>
  );
};

const UserCheckbox: React.FC<{
  user: User;
  checked: boolean;
  onChange: (user: UserData) => void;
}> = ({ user, checked, onChange }) => {
  return (
    <>
      <Input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(user)}
      />
      &nbsp;
      {`${user.fullName} (${user.username})`}
    </>
  );
};

export default UserGroupSelector;
