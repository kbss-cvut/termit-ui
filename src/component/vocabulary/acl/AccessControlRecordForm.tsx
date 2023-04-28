import React from "react";
import { useSelector } from "react-redux";
import { Button, ButtonGroup, FormGroup, FormText, Label } from "reactstrap";
// @ts-ignore
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

interface AccessControlRecordFormProps {
  record: AccessControlRecord<any>;
  holderReadOnly?: boolean; // Holder and its type is editable only for new records
  existingHolders?: string[]; // Identifiers of existing record holders. They should not be available in the selector
  onChange: (change: Partial<AccessControlRecord<any>>) => void;
}

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
 * The following holder types cannot have the maximum access level.
 */
const RESTRICTED_HOLDER_TYPES = [
  VocabularyUtils.USER_RESTRICTED,
  VocabularyUtils.USER_GROUP,
];
/**
 * The following holder IRI (Restricted user role) cannot have the maximum access level.
 */
const RESTRICTED_HOLDER_IRI =
  VocabularyUtils.NS_TERMIT + "omezen\u00fd-u\u017eivatel-termitu";

const MAX_ACCESS_LEVEL =
  VocabularyUtils.NS_TERMIT +
  "\u00farove\u0148-p\u0159\u00edstupov\u00fdch-opr\u00e1vn\u011bn\u00ed/spr\u00e1va";

function filterAccessLevels(accessLevels: RdfsResource[], holder?: AssetData) {
  if (!holder) {
    return accessLevels;
  }
  const types = Utils.sanitizeArray(holder.types);
  const shouldRestrict =
    holder.iri === RESTRICTED_HOLDER_IRI ||
    types.some((t) => RESTRICTED_HOLDER_TYPES.indexOf(t) !== -1);
  return shouldRestrict
    ? accessLevels.filter((r) => r.iri !== MAX_ACCESS_LEVEL)
    : accessLevels;
}

function shouldResetAccessLevel(
  holder?: AccessHolderType,
  currentAccessLevel?: string
) {
  if (currentAccessLevel !== MAX_ACCESS_LEVEL || !holder) {
    return false;
  }
  return (
    Utils.sanitizeArray(holder.types).some(
      (t) => RESTRICTED_HOLDER_TYPES.indexOf(t) !== -1
    ) || holder.iri === RESTRICTED_HOLDER_IRI
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
          showSettings={false}
          multi={false}
          displayInfoOnHover={false}
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
