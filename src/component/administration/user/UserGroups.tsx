import React from "react";
import User from "../../../model/User";
import UserGroup from "../../../model/UserGroup";

export const UserGroups: React.FC<{ user: User; groups: UserGroup[] }> = ({
  user,
  groups,
}) => {
  const actualGroups = groups.filter(
    (g) => g.members.find((m) => m.iri === user.iri) !== undefined
  );
  if (actualGroups.length > 0) {
    return (
      <ul>
        {actualGroups.map((g) => (
          <li key={g.iri}>{g.label}</li>
        ))}
      </ul>
    );
  }
  return null;
};
