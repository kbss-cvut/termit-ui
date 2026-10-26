import {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Vocabulary from "../../model/Vocabulary";
import { SkosCollectionDto } from "../../model/Collection";
import {
  ColumnDef,
  getCoreRowModel,
  PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import Table from "../misc/table/Table";
import { ThunkDispatch, useAppSelector } from "../../util/Types";
import { useDispatch } from "react-redux";
import { loadSkosCollections } from "../../action/AsyncCollectionActions";
import VocabularyUtils from "../../util/VocabularyUtils";
import "./CollectionsList.scss";
import { INITIAL_PAGINATION } from "../../util/UISettingsUtil";
import { OrderedCollectionIcon } from "./OrderedCollectionIcon";
import { CollectionLink } from "./CollectionLink";
import If from "../misc/If";
import { Button, Label, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import Routing, { Vocabularies } from "../../util/Routing";
import Routes from "../../util/Routes";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { EMPTY_PAGE } from "../../model/ResultPage";
import { FaPlus } from "react-icons/fa6";

export interface CollectionsListProps {
  vocabulary: Vocabulary;
  shortLocale: string;
}

const SKOS_COLLECTIONS_LIST_LOADING_PROMISE_AREA =
  "SKOS_COLLECTIONS_LIST_LOADING_PROMISE_AREA";

export const CollectionsList: FunctionComponent<CollectionsListProps> = ({
  vocabulary,
  shortLocale,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const collectionsPage = useAppSelector((state) => state.skosCollections);
  const totalCount = collectionsPage?.totalCount;

  const [pagination, setPagination] =
    useState<PaginationState>(INITIAL_PAGINATION);

  // Reset pagination when vocabulary changes
  useEffect(() => {
    setPagination(INITIAL_PAGINATION);
  }, [vocabulary.iri]);

  const loadCollections = useCallback(() => {
    const controller = new AbortController();
    const vocabularyIri = VocabularyUtils.create(vocabulary.iri);
    trackPromise(
      dispatch(
        loadSkosCollections(
          vocabularyIri,
          { page: pagination.pageIndex, size: pagination.pageSize },
          controller.signal
        )
      ),
      SKOS_COLLECTIONS_LIST_LOADING_PROMISE_AREA
    );
    return () => controller.abort();
  }, [dispatch, pagination.pageIndex, pagination.pageSize, vocabulary.iri]);

  useEffect(() => {
    // vocabulary IRI changed
    loadCollections();
  }, [loadCollections, vocabulary.iri]);

  useEffect(() => {
    // page not loaded
    if (collectionsPage == null) {
      loadCollections();
    }
  }, [loadCollections, collectionsPage]);

  const columns = useMemo<ColumnDef<SkosCollectionDto>[]>(
    () => [
      {
        id: "label",
        header: "",
        cell: ({ row }) => (
          <>
            <If expression={row.original.isOrdered()}>
              <OrderedCollectionIcon
                id={"collections-list-entry-" + row.index}
              />
            </If>
            <CollectionLink
              collection={row.original}
              shortLocale={shortLocale}
            />
          </>
        ),
        enableSorting: false,
      },
    ],
    [shortLocale]
  );

  const onCreateClick = useCallback(() => {
    Routing.transitionTo(
      Routes.createVocabularyCollection,
      Vocabularies.getVocabularyRoutingOptions(vocabulary)
    );
  }, [vocabulary]);

  const { pageContent } = collectionsPage ?? EMPTY_PAGE;

  const tableInstance = useReactTable<SkosCollectionDto>({
    columns,
    data: pageContent,
    getCoreRowModel: getCoreRowModel(),
    enableColumnFilters: false,
    enableSorting: false,
    manualPagination: true,
    rowCount: totalCount,
    state: { pagination },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function" ? updater(pagination) : updater;
      if (
        newState.pageSize !== pagination.pageSize ||
        newState.pageIndex !== pagination.pageIndex
      ) {
        setPagination(newState);
      }
    },
  });

  return (
    <>
      <IfVocabularyActionAuthorized
        key="collection-detail-remove"
        vocabulary={vocabulary}
        requiredAccessLevel={AccessLevel.WRITE}
      >
        <Row className={"justify-content-end mt-2 mx-0"}>
          <Button
            color="success"
            size="sm"
            style={{ float: "right" }}
            onClick={onCreateClick}
          >
            <FaPlus />
            &nbsp;
            {i18n("collection.create")}
          </Button>
        </Row>
      </IfVocabularyActionAuthorized>
      <Row className={"skos-collections-list mt-3 mx-0"}>
        <If expression={pageContent.length === 0}>
          <Label>{i18n("collections.empty")}</Label>
        </If>
        <If expression={pageContent.length > 0}>
          <Table instance={tableInstance} />
        </If>
      </Row>
      <PromiseTrackingMask area={SKOS_COLLECTIONS_LIST_LOADING_PROMISE_AREA} />
    </>
  );
};
