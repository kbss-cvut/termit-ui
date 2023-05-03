import React from "react";
import { useDispatch, useSelector } from "react-redux";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import UserGroup from "../../../model/UserGroup";
import { AccessHolderType } from "../../../model/acl/AccessControlList";
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
  disabled?: boolean;
  existingHolders: string[];
}

interface SelectOption {
  value: string;
  label: string;
}

const AccessControlHolderSelector: React.FC<AccessControlHolderSelectorProps> =
  ({ holderType, holder, onChange, disabled = false, existingHolders }) => {
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
      let optionArr: SelectOption[] = [];
      switch (holderType) {
        case VocabularyUtils.USER:
          optionArr = users.map((u) => ({
            value: u.iri,
            label: `${u.fullName} (${u.username})`,
          }));
          break;
        case VocabularyUtils.USER_GROUP:
          optionArr = groups.map((g) => ({ value: g.iri!, label: g.label }));
          break;
        case VocabularyUtils.USER_ROLE:
          // Admin has always Security access, no point in setting access rights to them
          optionArr = roles
            .filter((r) => r.iri !== VocabularyUtils.USER_ADMIN)
            .map((r) => ({
              value: r.iri,
              label: getLocalized(r.label, locale),
            }));
          break;
        default:
          break;
      }
      if (!disabled) {
        optionArr = optionArr.filter(
          (o) => existingHolders.indexOf(o.value) === -1
        );
      }
      return optionArr;
    }, [users, roles, groups, locale, holderType, disabled, existingHolders]);

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
          isDisabled={disabled}
        />
        <FormText>{i18n("required")}</FormText>
      </>
    );
  };

export default AccessControlHolderSelector;
