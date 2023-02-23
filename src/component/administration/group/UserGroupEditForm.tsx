import React from "react";
import { Col, Row } from "reactstrap";
import CustomInput from "../../misc/CustomInput";
import { useI18n } from "../../hook/useI18n";
import UserGroupMemberSelector from "./UserGroupMemberSelector";
import { UserData } from "../../../model/User";

interface GroupEditFormProps {
  label: string;
  members: UserData[];
  onLabelChange: (label: string) => void;
  onMembersChange: (members: UserData[]) => void;
}

const UserGroupEditForm: React.FC<GroupEditFormProps> = ({
  label,
  members,
  onLabelChange,
  onMembersChange,
}) => {
  const { i18n } = useI18n();

  return (
    <>
      <Row>
        <Col>
          <CustomInput
            label={i18n("asset.label")}
            onChange={(e) => onLabelChange(e.currentTarget.value)}
            value={label}
          />
        </Col>
      </Row>
      <Row>
        <Col>
          <UserGroupMemberSelector
            members={members}
            onChange={onMembersChange}
          />
        </Col>
      </Row>
    </>
  );
};

export default UserGroupEditForm;
