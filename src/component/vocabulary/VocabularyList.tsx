import * as React from "react";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import Vocabulary from "../../model/Vocabulary";
import {
  Column,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import TextBasedFilter, {
  multilingualTextContainsFilterFactory,
} from "../misc/table/TextBasedFilter";
import VocabularyLink from "./VocabularyLink";
import { useI18n } from "../hook/useI18n";
import Table from "../misc/table/Table";
import { getShortLocale } from "../../util/IntlUtil";

export const VocabularyList: React.FC = () => {
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const { i18n, locale } = useI18n();
  const data = React.useMemo(
    () => Object.keys(vocabularies).map((v) => vocabularies[v]),
    [vocabularies]
  );
  const columns: Column<Vocabulary>[] = React.useMemo(
    () => [
      {
        Header: i18n("vocabulary.title"),
        accessor: "label",
        Filter: TextBasedFilter,
        filter: "text",
        Cell: ({ row }) => <VocabularyLink vocabulary={row.original} />,
      },
    ],
    [i18n]
  );
  const filterTypes = React.useMemo(
    () => ({
      text: multilingualTextContainsFilterFactory(getShortLocale(locale)),
    }),
    [locale]
  );
  const tableInstance = useTable<Vocabulary>(
    {
      columns,
      data,
      filterTypes,
      initialState: {
        sortBy: [
          {
            id: "label",
            desc: false,
          },
        ],
      },
    } as any,
    useFilters,
    useSortBy,
    usePagination
  );

  return (
    <div id="vocabulary-list" className="asset-list">
      <Table instance={tableInstance} />
    </div>
  );
};

export default VocabularyList;
