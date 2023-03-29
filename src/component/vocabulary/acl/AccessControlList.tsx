import React from "react";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import {
  createAccessControlRecord,
  loadAccessLevels,
  loadVocabularyAccessControlList,
} from "../../../action/AsyncAccessControlActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {
  AccessControlList as AccessControlListModel,
  AccessControlRecord,
} from "../../../model/AccessControlList";
import { Button } from "reactstrap";
import { GoPlus } from "react-icons/go";
import { useI18n } from "../../hook/useI18n";
import AccessControlRecordsTable from "./AccessControlRecordsTable";
import "./AccessControlList.scss";
import Utils from "../../../util/Utils";
import TermItState from "../../../model/TermItState";
import CreateAccessControlRecord from "./CreateAccessControlRecord";
import AssetFactory from "../../../util/AssetFactory";

function sortRecords(records: AccessControlRecord<any>[], levels: string[]) {
  const grouped = {};
  levels.reverse();
  levels.forEach((l) => (grouped[l] = []));
  records.forEach((r) => {
    const type = levels.find((level) => r.level === level);
    if (!type) {
      return;
    }
    grouped[type].push(r);
  });
  const result: AccessControlRecord<any>[] = [];
  Object.keys(grouped).forEach((k) => {
    const arr = grouped[k];
    arr.sort(recordComparator);
    result.push(...arr);
  });
  return result;
}

function recordComparator(
  a: AccessControlRecord<any>,
  b: AccessControlRecord<any>
) {
  const tA = typeExtractor(a);
  const tB = typeExtractor(b);
  if (tA !== tB) {
    return tA.localeCompare(tB);
  }
  return a.holder.iri.localeCompare(b.holder.iri);
}

function typeExtractor(r: AccessControlRecord<any>) {
  const types = Utils.sanitizeArray(r.holder.types);
  if (types.indexOf(VocabularyUtils.USER) !== -1) {
    return VocabularyUtils.USER;
  } else if (types.indexOf(VocabularyUtils.USER_GROUP) !== -1) {
    return VocabularyUtils.USER_GROUP;
  }
  return VocabularyUtils.USER_ROLE;
}

const AccessControlList: React.FC<{ vocabularyIri: string }> = ({
  vocabularyIri,
}) => {
  const { i18n } = useI18n();
  const [acl, setAcl] =
    React.useState<AccessControlListModel | undefined>(undefined);
  const [showCreateDialog, setShowCreateDialog] = React.useState(false);
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
  // TODO
  const onEditClick = (record: AccessControlRecord<any>) => {};
  const onRemoveClick = (record: AccessControlRecord<any>) => {};
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
