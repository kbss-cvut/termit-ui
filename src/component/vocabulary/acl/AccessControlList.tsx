import React from "react";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import {
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
import AccessRecordsTable from "./AccessRecordsTable";
import "./AccessControlList.scss";

const AccessControlList: React.FC<{ vocabularyIri: string }> = ({
  vocabularyIri,
}) => {
  const { i18n } = useI18n();
  const [acl, setAcl] =
    React.useState<AccessControlListModel | undefined>(undefined);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadAccessLevels());
  }, [dispatch]);
  React.useEffect(() => {
    dispatch(
      loadVocabularyAccessControlList(VocabularyUtils.create(vocabularyIri))
    ).then((data?: AccessControlListModel) => setAcl(data));
  }, [dispatch, vocabularyIri]);
  const onEditClick = (record: AccessControlRecord<any>) => {};
  const onRemoveClick = (record: AccessControlRecord<any>) => {};

  if (!acl) {
    return null;
  }
  return (
    <div id="vocabulary-acl" className="additional-metadata-container">
      <div className="mb-2 text-right">
        <Button
          id="acl-record-create"
          color="primary"
          size="sm"
          title={i18n("vocabulary.acl.record.create.title")}
        >
          <GoPlus />
          &nbsp;{i18n("vocabulary.acl.record.create")}
        </Button>
      </div>
      <AccessRecordsTable
        acl={acl}
        onEdit={onEditClick}
        onRemove={onRemoveClick}
      />
    </div>
  );
};

export default AccessControlList;
