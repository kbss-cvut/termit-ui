import React, { ChangeEvent } from "react";
import { Col, Row } from "reactstrap";
import CustomInput from "../../misc/CustomInput";
import { useI18n } from "../../hook/useI18n";
import UserGroupMemberSelector from "./UserGroupMemberSelector";
import { UserData } from "../../../model/User";
import ValidationResult, {
  Severity,
} from "../../../model/form/ValidationResult";

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
  const [labelEdited, setLabelEdited] = React.useState(label.length > 0);
  const onLabelEdit = (e: ChangeEvent<HTMLInputElement>) => {
    onLabelChange(e.currentTarget.value);
    setLabelEdited(true);
  };
  const validation =
    labelEdited && label.trim().length === 0
      ? new ValidationResult(
          Severity.BLOCKER,
          i18n("administration.groups.label.invalid")
        )
      : undefined;

  return (
    <>
      <Row>
        <Col>
          <CustomInput
            label={i18n("asset.label")}
            onChange={onLabelEdit}
            required={true}
            hint={i18n("required")}
            value={label}
            validation={validation}
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
