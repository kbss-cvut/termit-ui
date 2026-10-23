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
import { ThunkDispatch } from "../../util/Types";
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
import { GoPlus } from "react-icons/go";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";

export interface CollectionsListProps {
  vocabulary: Vocabulary;
  shortLocale: string;
}

export const CollectionsList: FunctionComponent<CollectionsListProps> = ({
  vocabulary,
  shortLocale,
}) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [collections, setCollections] = useState<SkosCollectionDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagination, setPagination] =
    useState<PaginationState>(INITIAL_PAGINATION);

  // Reset pagination when vocabulary changes
  useEffect(() => {
    setPagination(INITIAL_PAGINATION);
  }, [vocabulary.iri]);

  useEffect(() => {
    const controller = new AbortController();
    const vocabularyIri = VocabularyUtils.create(vocabulary.iri);
    dispatch(
      loadSkosCollections(
        vocabularyIri,
        { page: pagination.pageIndex, size: pagination.pageSize },
        controller.signal
      )
    ).then((page) => {
      if (!controller.signal.aborted) {
        setCollections(page.pageContent);
        setTotalCount(page.totalCount);
      }
    });
    return () => controller.abort();
  }, [vocabulary.iri, pagination.pageIndex, pagination.pageSize, dispatch]);

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

  const tableInstance = useReactTable<SkosCollectionDto>({
    columns,
    data: collections,
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
            <GoPlus />
            &nbsp;
            {i18n("collection.create")}
          </Button>
        </Row>
      </IfVocabularyActionAuthorized>
      <Row className={"skos-collections-list mt-3 mx-0"}>
        <If expression={collections.length === 0}>
          <Label>{i18n("collections.empty")}</Label>
        </If>
        <If expression={collections.length > 0}>
          <Table instance={tableInstance} />
        </If>
      </Row>
    </>
  );
};
