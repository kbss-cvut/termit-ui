import React from "react";
import { useSelector } from "react-redux";
import { Button, ButtonGroup, FormGroup, FormText, Label } from "reactstrap";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import { AccessControlRecord } from "../../../model/AccessControlList";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { useI18n } from "../../hook/useI18n";
import TermItState from "../../../model/TermItState";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import RdfsResource from "../../../model/RdfsResource";
import { stripAccessLevelLabel } from "./AccessLevelBadge";
import AccessControlHolderSelector from "./AccessControlHolderSelector";
import Utils from "../../../util/Utils";

interface AccessControlRecordFormProps {
  record: AccessControlRecord<any>;
  canSelectHolderType?: boolean; // If the record is new, it should be possible to select holder type.
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

const AccessControlRecordForm: React.FC<AccessControlRecordFormProps> = ({
  record,
  canSelectHolderType = true,
  onChange,
}) => {
  const { i18n, locale } = useI18n();
  const [holderType, setHolderType] = React.useState(resolveHolderType(record));
  const accessLevels = useSelector((state: TermItState) =>
    Object.values(state.accessLevels)
  );
  const onSelectHolderType = (type: string) => {
    setHolderType(type);
    onChange({ holder: undefined });
  };
  const onLevelSelect = (option: RdfsResource) => {
    onChange({ level: option.iri });
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
              className="w-100"
              outline={true}
              size="sm"
              active={holderType === HOLDER_TYPES[k]}
              disabled={!canSelectHolderType}
              onClick={() => onSelectHolderType(HOLDER_TYPES[k])}
            >
              {i18n(k)}
            </Button>
          ))}
        </ButtonGroup>
        <AccessControlHolderSelector
          holderType={holderType}
          holder={record.holder}
          onChange={(holder) => onChange({ holder, types: [holderType] })}
        />
      </FormGroup>

      <FormGroup>
        <Label className="attribute-label">
          {i18n("vocabulary.acl.record.level")}
        </Label>
        <IntelligentTreeSelect
          options={accessLevels}
          onChange={onLevelSelect}
          value={accessLevels.find((l) => l.iri === record.level)}
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
