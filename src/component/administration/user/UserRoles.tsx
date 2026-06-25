import React from "react";
import { useSelector } from "react-redux";
import Utils from "../../../util/Utils";
import { getLocalized } from "../../../model/MultilingualString";
import { UserRoleData } from "../../../model/UserRole";
import User from "../../../model/User";
import TermItState from "../../../model/TermItState";
import { useI18n } from "../../hook/useI18n";
import { Badge } from "reactstrap";

export function filterActualRoles(types: string[], roles: UserRoleData[]) {
  return Utils.sanitizeArray(roles).filter((r) => types.indexOf(r.iri) >= 0);
}

const UserRoles: React.FC<{ user: User }> = ({ user }) => {
  const availableRoles = useSelector(
    (state: TermItState) => state.configuration.roles
  );
  const { locale } = useI18n();
  const actualRoles = filterActualRoles(user.types, availableRoles);
  if (actualRoles.length === 0) {
    return null;
  }
  return (
    <>
      {actualRoles.map((r) => (
        <Badge key={r.iri} color="info" className="user-role-badge">
          {getLocalized(r.label, locale)}
        </Badge>
      ))}
    </>
  );
};

export default UserRoles;
