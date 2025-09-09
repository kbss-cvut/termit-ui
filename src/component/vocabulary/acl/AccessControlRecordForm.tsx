import React from "react";
import { useSelector } from "react-redux";
import { Button, ButtonGroup, FormGroup, FormText, Label } from "reactstrap";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import {
  AccessControlRecord,
  AccessHolderType,
} from "../../../model/acl/AccessControlList";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { useI18n } from "../../hook/useI18n";
import TermItState from "../../../model/TermItState";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import RdfsResource from "../../../model/RdfsResource";
import { stripAccessLevelLabel } from "./AccessLevelBadge";
import AccessControlHolderSelector from "./AccessControlHolderSelector";
import Utils from "../../../util/Utils";
import classNames from "classnames";
import { AssetData } from "../../../model/Asset";
import AccessLevel, { hasAccess } from "../../../model/acl/AccessLevel";

interface AccessControlRecordFormProps {
  record: AccessControlRecord<any>;
  holderReadOnly?: boolean; // Holder and its type is editable only for new records
  existingHolders?: string[]; // Identifiers of existing record holders. They should not be available in the selector
  onChange: (change: Partial<AccessControlRecord<any>>) => void;
}

const accessGreaterThan = (a: AccessLevel, b?: string) => hasAccess(a, b);

const HOLDER_TYPES = {
  "type.user": VocabularyUtils.USER,
  "type.usergroup": VocabularyUtils.USER_GROUP,
  "type.userrole": VocabularyUtils.USER_ROLE,
};

function resolveHolderType(record: AccessControlRecord<any>): string {
  if (!record.holder) {
    return HOLDER_TYPES["type.userrole"];
  }
  const t =
    Object.keys(HOLDER_TYPES).find(
      (k) => record.holder.types.indexOf(HOLDER_TYPES[k]) !== -1
    ) || "type.userrole";
  return HOLDER_TYPES[t];
}

/**
 * The following holder types cannot have the specified access levels or greater.
 */
const LIMITED_ACCESS_LEVEL_BY_HOLDER_TYPE = {
  [VocabularyUtils.USER_ANONYMOUS]: AccessLevel.WRITE,
  [VocabularyUtils.USER_RESTRICTED]: AccessLevel.SECURITY,
  [VocabularyUtils.USER_GROUP]: AccessLevel.SECURITY,
};

function filterAccessLevels(accessLevels: RdfsResource[], holder?: AssetData) {
  if (!holder) {
    return accessLevels;
  }
  let limitedAccessLevel: AccessLevel | undefined;
  if (holder.types == null) {
    return accessLevels;
  }

  const types = [...Utils.sanitizeArray(holder.types)];
  // add the holder iri to the types
  if (holder.iri) {
    types.push(holder.iri);
  }

  types.forEach((type) => {
    // if the type is in the limited access level list
    if (LIMITED_ACCESS_LEVEL_BY_HOLDER_TYPE[type]) {
      if (limitedAccessLevel) {
        // compare the current max access level with the type max access level
        // and set the higher one
        limitedAccessLevel = accessGreaterThan(
          limitedAccessLevel,
          LIMITED_ACCESS_LEVEL_BY_HOLDER_TYPE[type]
        )
          ? limitedAccessLevel
          : LIMITED_ACCESS_LEVEL_BY_HOLDER_TYPE[type];
      } else {
        // if no max access level is set, set it to the type max access level
        limitedAccessLevel = LIMITED_ACCESS_LEVEL_BY_HOLDER_TYPE[type];
      }
    }
  });

  return limitedAccessLevel
    ? accessLevels.filter((r) => !accessGreaterThan(limitedAccessLevel!, r.iri))
    : accessLevels;
}

function shouldResetAccessLevel(
  holder?: AccessHolderType,
  currentAccessLevel?: string
) {
  if (!holder || !currentAccessLevel || !holder.iri) {
    return false;
  }
  return accessGreaterThan(
    LIMITED_ACCESS_LEVEL_BY_HOLDER_TYPE[holder.iri],
    currentAccessLevel
  );
}

const AccessControlRecordForm: React.FC<AccessControlRecordFormProps> = ({
  record,
  holderReadOnly = false,
  existingHolders = [],
  onChange,
}) => {
  const { i18n, locale } = useI18n();
  const [holderType, setHolderType] = React.useState(resolveHolderType(record));
  const accessLevels = useSelector((state: TermItState) =>
    Object.values(state.accessLevels)
  );
  const accessLevelOptions = React.useMemo(
    () => filterAccessLevels(accessLevels, record.holder),
    [accessLevels, record.holder]
  );
  const onSelectHolderType = (type: string) => {
    setHolderType(type);
    onChange({ holder: undefined, accessLevel: undefined });
  };
  const onHolderSelect = (holder?: AccessHolderType) => {
    const change: Partial<AccessControlRecord<any>> = {
      holder,
      types: [holderType],
    };
    if (shouldResetAccessLevel(holder, record.accessLevel)) {
      change.accessLevel = undefined;
    }
    onChange(change);
  };
  const onLevelSelect = (option: RdfsResource) => {
    onChange({ accessLevel: option.iri });
  };

  return (
    <>
      <FormGroup>
        <Label className="attribute-label">
          {i18n("vocabulary.acl.record.holder")}
        </Label>
        <ButtonGroup className="d-flex mb-3">
          {Object.keys(HOLDER_TYPES).map((k) => (
            <Button
              key={k}
              id={`acr-holder-type-${k}`}
              color="primary"
              className={classNames("w-100", {
                "acl-active-disabled-button":
                  holderReadOnly && holderType === HOLDER_TYPES[k],
              })}
              outline={true}
              size="sm"
              active={holderType === HOLDER_TYPES[k]}
              disabled={holderReadOnly}
              onClick={() => onSelectHolderType(HOLDER_TYPES[k])}
            >
              {i18n(k)}
            </Button>
          ))}
        </ButtonGroup>
        <AccessControlHolderSelector
          holderType={holderType}
          holder={record.holder}
          onChange={onHolderSelect}
          disabled={holderReadOnly}
          existingHolders={existingHolders}
        />
      </FormGroup>

      <FormGroup>
        <Label className="attribute-label">
          {i18n("vocabulary.acl.record.level")}
        </Label>
        <IntelligentTreeSelect
          id="access-level-selector"
          options={accessLevelOptions}
          onChange={onLevelSelect}
          value={accessLevelOptions.find((l) => l.iri === record.accessLevel)}
          valueKey="iri"
          renderAsTree={false}
          getOptionLabel={(option: RdfsResource) =>
            stripAccessLevelLabel(
              getLocalized(option.label, getShortLocale(locale))
            )
          }
          valueRenderer={Utils.simpleValueRenderer}
          multi={false}
          expanded={false}
          placeholder=""
          isClearable={false}
        />
        <FormText>{i18n("required")}</FormText>
      </FormGroup>
    </>
  );
};

export default AccessControlRecordForm;
