import * as React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary from "../../model/Vocabulary";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { multilingualTextContainsFilterFactory } from "../misc/table/TextBasedFilter";
import VocabularyLink from "./VocabularyLink";
import { useI18n } from "../hook/useI18n";
import Table from "../misc/table/Table";
import { getShortLocale } from "../../util/IntlUtil";
import { getLocalized } from "../../model/MultilingualString";

export const VocabularyList: React.FC = () => {
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const { i18n, locale } = useI18n();
  const data = React.useMemo(
    () => Object.keys(vocabularies).map((v) => vocabularies[v]),
    [vocabularies]
  );
  const columns: ColumnDef<Vocabulary>[] = React.useMemo(
    () => [
      {
        header: i18n("vocabulary.title"),
        id: "label",
        accessorFn: (row) => getLocalized(row.label, getShortLocale(locale)),
        filterFn: multilingualTextContainsFilterFactory(getShortLocale(locale)),
        cell: ({ row }) => <VocabularyLink vocabulary={row.original} />,
      },
    ],
    [i18n, locale]
  );

  const tableInstance = useReactTable<Vocabulary>({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div id="vocabulary-list" className="asset-list">
      <Table instance={tableInstance} />
    </div>
  );
};

export default VocabularyList;
