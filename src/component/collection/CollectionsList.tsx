import { FunctionComponent, useEffect, useMemo, useState } from "react";
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
import { Button, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";

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
        pagination.pageIndex,
        pagination.pageSize,
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
      <Row className={"justify-content-end mt-2"}>
        <Button color="success" size="sm" style={{ float: "right" }}>
          {i18n("create")}
        </Button>
      </Row>
      <Row className={"skos-collections-list mt-3"}>
        <Table instance={tableInstance} />
      </Row>
    </>
  );
};
