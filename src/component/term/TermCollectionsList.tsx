import { FunctionComponent, useCallback, useEffect, useState } from "react";
import Term from "../../model/Term";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import {
  SkosCollectionDto,
  SkosCollectionDtoData,
} from "../../model/Collection";
import {
  addCollectionMember,
  loadCollectionsWithTerm,
} from "../../action/AsyncCollectionActions";
import { useI18n } from "../hook/useI18n";
// @ts-ignore
import { List } from "reactstrap";
import { CollectionLink } from "../collection/CollectionLink";
import BadgeButton from "../misc/BadgeButton";
import { FaPlus } from "react-icons/fa6";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import ConfirmCancelDialog from "../misc/ConfirmCancelDialog";
import { CollectionSelect } from "../collection/CollectionSelect";
import Vocabulary from "../../model/Vocabulary";
import If from "../misc/If";
import AsyncActionStatus from "../../action/AsyncActionStatus";
import { isVocabularyActionAuthorized } from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";

const TERM_COLLECTIONS_LIST_PROMSIE_AREA = "TERM_COLLECTIONS_LIST_PROMSIE_AREA";

export const TermCollectionsList: FunctionComponent<{
  term: Term;
  vocabulary: Vocabulary;
}> = ({ term, vocabulary }) => {
  const dispatch: ThunkDispatch = useDispatch();
  const { i18n, locale } = useI18n();
  const [collections, setCollections] = useState<SkosCollectionDto[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  // selected collection to which the term should be added
  const [selectedCollection, setSelectedCollection] =
    useState<SkosCollectionDtoData | null>(null);

  const loadCollectionsOfTerm = useCallback(() => {
    trackPromise(
      dispatch(loadCollectionsWithTerm(term)).then((action) => {
        if ("payload" in action) {
          setCollections(action.payload);
        }
      }),
      TERM_COLLECTIONS_LIST_PROMSIE_AREA
    );
  }, [dispatch, term]);

  useEffect(() => {
    loadCollectionsOfTerm();
  }, [dispatch, loadCollectionsOfTerm, term]);

  const closeAddDialog = useCallback(() => {
    setShowAddDialog(false);
    setSelectedCollection(null);
  }, []);

  const isModificationAuthorized = isVocabularyActionAuthorized(
    vocabulary,
    AccessLevel.WRITE,
    "edit"
  );

  const addToCollection = useCallback(() => {
    if (!selectedCollection || !isModificationAuthorized) {
      return;
    }
    const dto = new SkosCollectionDto(selectedCollection);
    dispatch(addCollectionMember(dto, term.iri)).then((action) => {
      if (action.status === AsyncActionStatus.SUCCESS) {
        loadCollectionsOfTerm();
        closeAddDialog();
      }
    });
  }, [
    closeAddDialog,
    dispatch,
    isModificationAuthorized,
    loadCollectionsOfTerm,
    selectedCollection,
    term.iri,
  ]);

  const AddButton = useCallback(
    () => (
      <If expression={isModificationAuthorized}>
        <BadgeButton
          color="outline-dark"
          onClick={() => setShowAddDialog(true)}
          className="ml-1 align-top"
          title={i18n("term.metadata.collection.add.title")}
        >
          <FaPlus />
        </BadgeButton>
      </If>
    ),
    [i18n, isModificationAuthorized]
  );

  return (
    <>
      <List type="unstyled" className="mb-3 relative">
        {collections.map((dto, index) => (
          <li key={"term-in-collections-list-" + dto.iri}>
            <CollectionLink collection={dto} shortLocale={locale} />
            {index === collections.length - 1 && <AddButton />}
          </li>
        ))}
        <If expression={collections.length === 0}>
          <AddButton />
        </If>
        <PromiseTrackingMask area={TERM_COLLECTIONS_LIST_PROMSIE_AREA} />
      </List>
      <If expression={isModificationAuthorized}>
        <ConfirmCancelDialog
          show={showAddDialog}
          onClose={closeAddDialog}
          onConfirm={addToCollection}
          id={"term-collections-list-add-to-collection-dialog"}
          title={i18n("term.metadata.collection.add.title")}
          confirmKey={"collection.members.add"}
          confirmDisabled={selectedCollection == null}
        >
          <CollectionSelect
            vocabulary={vocabulary}
            value={selectedCollection}
            setValue={setSelectedCollection}
            exclude={collections}
          />
        </ConfirmCancelDialog>
      </If>
    </>
  );
};
