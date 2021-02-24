import React from "react";
import {injectIntl} from "react-intl";
import {connect} from "react-redux";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Utils from "../../util/Utils";
import {getLocalized} from "../../model/MultilingualString";
import UserRole, {UserRoleData} from "../../model/UserRole";
import User from "../../model/User";
import TermItState from "../../model/TermItState";

export function filterActualRoles(types : string[], roles : UserRoleData[]) {
    return Utils.sanitizeArray(roles).filter(r => types.indexOf(r.iri) >= 0);
}

interface UserRoleProps extends HasI18n {
    user: User,
    availableRoles: UserRole[]
}

const UserRoles = (props: UserRoleProps) => {
    const {availableRoles, user, locale} = props;
    const actualRoles = filterActualRoles(user.types, availableRoles);
    if (actualRoles.length === 0) {
        return null;
    }
    return <div>
        {actualRoles.map(r => getLocalized(r.label, locale)).join(", ")}
    </div>;
}

export default connect((state : TermItState) => ({availableRoles: state.configuration.roles}))(injectIntl(withI18n(UserRoles)));