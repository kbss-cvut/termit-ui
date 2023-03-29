import React from "react";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import UserGroup from "../../../model/UserGroup";
import { AccessHolderType } from "../../../model/AccessControlList";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import { loadUserGroups } from "../../../action/AsyncUserGroupActions";
import { useI18n } from "../../hook/useI18n";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { getLocalized } from "../../../model/MultilingualString";
import { FormText } from "reactstrap";
import { loadUsers } from "../../../action/AsyncUserActions";
import Utils from "../../../util/Utils";

interface AccessControlHolderSelectorProps {
  holderType: string;
  holder?: AccessHolderType;
  onChange: (holder?: AccessHolderType) => void;
}

const AccessControlHolderSelector: React.FC<AccessControlHolderSelectorProps> =
  ({ holderType, holder, onChange }) => {
    const { i18n, locale } = useI18n();
    const users = useSelector((state: TermItState) => state.users);
    const roles = useSelector(
      (state: TermItState) => state.configuration.roles
    );
    const [groups, setGroups] = React.useState<UserGroup[]>([]);
    const dispatch: ThunkDispatch = useDispatch();
    React.useEffect(() => {
      dispatch(loadUsers());
      dispatch(loadUserGroups()).then((data) => setGroups(data));
    }, [dispatch, setGroups]);
    const onSelect = (option: { value: string; label: string }) => {
      switch (holderType) {
        case VocabularyUtils.USER:
          onChange(users.find((u) => u.iri === option.value));
          break;
        case VocabularyUtils.USER_GROUP:
          onChange(groups.find((u) => u.iri === option.value));
          break;
        case VocabularyUtils.USER_ROLE:
          onChange(roles.find((r) => r.iri === option.value));
          break;
      }
    };

    const options = React.useMemo(() => {
      switch (holderType) {
        case VocabularyUtils.USER:
          return users.map((u) => ({
            value: u.iri,
            label: `${u.fullName} (${u.username})`,
          }));
        case VocabularyUtils.USER_GROUP:
          return groups.map((g) => ({ value: g.iri, label: g.label }));
        case VocabularyUtils.USER_ROLE:
          return roles.map((r) => ({
            value: r.iri,
            label: getLocalized(r.label, locale),
          }));
        default:
          return [];
      }
    }, [users, roles, groups, locale, holderType]);

    return (
      <>
        <IntelligentTreeSelect
          options={options}
          onChange={onSelect}
          value={
            holder ? options.find((o) => o.value === holder.iri) : undefined
          }
          renderAsTree={false}
          showSettings={false}
          multi={false}
          displayInfoOnHover={false}
          expanded={false}
          placeholder=""
          isClearable={false}
          valueRenderer={Utils.simpleValueRenderer}
        />
        <FormText>{i18n("required")}</FormText>
      </>
    );
  };

export default AccessControlHolderSelector;
