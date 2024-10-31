import React from "react";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import {
  createAccessControlRecord,
  loadAccessLevels,
  loadVocabularyAccessControlList,
  removeAccessControlRecord,
  updateAccessControlRecord,
} from "../../../action/AsyncAccessControlActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {
  AbstractAccessControlRecord,
  AccessControlList as AccessControlListModel,
  AccessControlRecord,
  AccessControlRecordData,
} from "../../../model/acl/AccessControlList";
import { Button } from "reactstrap";
import { GoPlus } from "react-icons/go";
import { useI18n } from "../../hook/useI18n";
import AccessControlRecordsTable from "./AccessControlRecordsTable";
import "./AccessControlList.scss";
import Utils from "../../../util/Utils";
import TermItState from "../../../model/TermItState";
import CreateAccessControlRecord from "./CreateAccessControlRecord";
import AssetFactory from "../../../util/AssetFactory";
import RemoveAccessControlRecordDialog from "./RemoveAccessControlRecordDialog";
import EditAccessControlRecordDialog from "./EditAccessControlRecordDialog";

function sortRecords(records: AccessControlRecordData[], levels: string[]) {
  const grouped = {};
  levels.reverse();
  levels.forEach((l) => (grouped[l] = []));
  records.forEach((r) => {
    const type = levels.find((level) => r.accessLevel === level);
    if (!type) {
      return;
    }
    grouped[type].push(r);
  });
  const result: AccessControlRecordData[] = [];
  Object.keys(grouped).forEach((k) => {
    const arr = grouped[k];
    arr.sort(recordComparator);
    result.push(...arr);
  });
  return result;
}

function recordComparator(
  a: AccessControlRecordData,
  b: AccessControlRecordData
) {
  const tA = typeExtractor(a);
  const tB = typeExtractor(b);
  if (tA !== tB) {
    return tA.localeCompare(tB);
  }
  return a.holder.iri.localeCompare(b.holder.iri);
}

function typeExtractor(r: AccessControlRecordData) {
  const types = Utils.sanitizeArray(r.types);
  if (types.indexOf(VocabularyUtils.USER_ACCESS_RECORD) !== -1) {
    return VocabularyUtils.USER_ACCESS_RECORD;
  } else if (types.indexOf(VocabularyUtils.USERGROUP_ACCESS_RECORD) !== -1) {
    return VocabularyUtils.USERGROUP_ACCESS_RECORD;
  }
  return VocabularyUtils.USERROLE_ACCESS_RECORD;
}

const AccessControlList: React.FC<{ vocabularyIri: string }> = ({
  vocabularyIri,
}) => {
  const { i18n } = useI18n();
  const [acl, setAcl] = React.useState<AccessControlListModel | undefined>(
    undefined
  );
  const existingHolders = React.useMemo(
    () => (acl ? acl.records.map((r) => r.holder.iri) : []),
    [acl]
  );
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
  const [recordToRemove, setRecordToRemove] = React.useState<
    AccessControlRecordData | undefined
  >();
  const [recordToUpdate, setRecordToUpdate] = React.useState<
    AbstractAccessControlRecord<any> | undefined
  >();
  const accessLevels = useSelector((state: TermItState) => state.accessLevels);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadAccessLevels());
  }, [dispatch]);
  const processLoadedAcl = React.useMemo(
    () => (data?: AccessControlListModel) => {
      if (!data) {
        return;
      }
      data.records = sortRecords(data.records, Object.keys(accessLevels));
      setAcl(data);
    },
    [accessLevels, setAcl]
  );
  React.useEffect(() => {
    if (Object.keys(accessLevels).length > 0) {
      dispatch(
        loadVocabularyAccessControlList(VocabularyUtils.create(vocabularyIri))
      ).then((data) => processLoadedAcl(data));
    }
  }, [dispatch, vocabularyIri, accessLevels, processLoadedAcl]);
  const onEditClick = (record: AccessControlRecordData) => {
    setRecordToUpdate(AbstractAccessControlRecord.create(record));
  };
  const onRemoveClick = (record: AccessControlRecordData) => {
    setRecordToRemove(record);
  };
  const onRemoveRecord = () => {
    const vocIri = VocabularyUtils.create(vocabularyIri);
    dispatch(removeAccessControlRecord(vocIri, recordToRemove!))
      .then(() => {
        setRecordToRemove(undefined);
        return dispatch(loadVocabularyAccessControlList(vocIri));
      })
      .then((data) => processLoadedAcl(data));
  };
  const onChange = (change: Partial<AccessControlRecord<any>>) => {
    setRecordToUpdate(
      AbstractAccessControlRecord.create(
        Object.assign({}, recordToUpdate, change)
      )
    );
  };
  const onUpdateRecord = () => {
    const vocIri = VocabularyUtils.create(vocabularyIri);
    dispatch(updateAccessControlRecord(vocIri, recordToUpdate!))
      .then(() => {
        setRecordToUpdate(undefined);
        return dispatch(loadVocabularyAccessControlList(vocIri));
      })
      .then((data) => processLoadedAcl(data));
  };
  const onAddRecord = (record: AccessControlRecord<any>) => {
    const iri = VocabularyUtils.create(vocabularyIri);
    return dispatch(
      createAccessControlRecord(
        iri,
        AssetFactory.createAccessControlRecord(record)
      )
    )
      .then(() => {
        setShowCreateDialog(false);
        return dispatch(loadVocabularyAccessControlList(iri));
      })
      .then((data) => processLoadedAcl(data));
  };

  if (!acl) {
    return null;
  }
  return (
    <div id="vocabulary-acl" className="additional-metadata-container">
      <CreateAccessControlRecord
        show={showCreateDialog}
        onSubmit={onAddRecord}
        onCancel={() => setShowCreateDialog(false)}
        existingHolders={existingHolders}
      />
      <RemoveAccessControlRecordDialog
        show={recordToRemove !== undefined}
        onSubmit={onRemoveRecord}
        onCancel={() => setRecordToRemove(undefined)}
        record={recordToRemove}
      />
      <EditAccessControlRecordDialog
        show={recordToUpdate !== undefined}
        record={recordToUpdate!}
        onChange={onChange}
        onSubmit={onUpdateRecord}
        onCancel={() => setRecordToUpdate(undefined)}
        existingHolders={existingHolders}
      />
      <div className="mb-2 text-right">
        <Button
          id="acl-record-create"
          color="primary"
          size="sm"
          title={i18n("vocabulary.acl.record.create.title")}
          onClick={() => setShowCreateDialog(true)}
        >
          <GoPlus />
          &nbsp;{i18n("vocabulary.acl.record.create")}
        </Button>
      </div>
      <AccessControlRecordsTable
        acl={acl}
        onEdit={onEditClick}
        onRemove={onRemoveClick}
      />
    </div>
  );
};

export default AccessControlList;
