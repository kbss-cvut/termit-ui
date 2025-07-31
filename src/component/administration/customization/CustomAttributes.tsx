import React from "react";
import { useI18n } from "../../hook/useI18n";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { getCustomAttributes } from "../../../action/AsyncActions";
import PanelWithActions from "../../misc/PanelWithActions";
import {
  Column,
  useFilters,
  usePagination,
  useSortBy,
  useTable,
} from "react-table";
import { RdfProperty } from "../../../model/RdfsResource";
import TermItState from "../../../model/TermItState";
import TextBasedFilter, {
  multilingualTextContainsFilterFactory,
} from "../../misc/table/TextBasedFilter";
import { getShortLocale } from "../../../util/IntlUtil";
import { getLocalized } from "../../../model/MultilingualString";
import { Button } from "reactstrap";
import Table from "../../misc/table/Table";
import { GoPlus } from "react-icons/go";
import { Link } from "react-router-dom";
import { getRangeLabel, RANGE_OPTIONS } from "./CustomAttributeRangeSelector";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import VocabularyUtils from "../../../util/VocabularyUtils";

export const CustomAttributes: React.FC = () => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const properties = useSelector(
    (state: TermItState) => state.customAttributes
  );

  React.useEffect(() => {
    dispatch(getCustomAttributes());
  }, [dispatch]);

  const onEditClick = React.useCallback((property: RdfProperty) => {
    Routing.transitionTo(Routes.editCustomAttribute, {
      params: new Map<string, string>([
        ["name", VocabularyUtils.create(property.iri).fragment],
      ]),
    });
  }, []);

  const lang = getShortLocale(locale);
  const columns: Column<RdfProperty>[] = React.useMemo(
    () => [
      {
        Header: i18n("properties.edit.new.label"),
        accessor: "label",
        Filter: TextBasedFilter,
        filter: "text",
        Cell: ({ row }) => <>{row.original.getLabel(lang)}</>,
        className: "align-middle",
      },
      {
        Header: i18n("properties.edit.new.comment"),
        accessor: "comment",
        Filter: TextBasedFilter,
        filter: "text",
        Cell: ({ row }) => <>{getLocalized(row.original.comment, lang)}</>,
        className: "align-middle",
      },
      {
        Header: i18n("administration.customization.customAttributes.range"),
        accessor: "rangeIri",
        disableFilters: true,
        disableSortBy: true,
        className: "align-middle",
        Cell: ({ row }) => {
          const range = RANGE_OPTIONS.find(
            (opt) => opt.value === row.original.rangeIri
          );
          return range ? getRangeLabel(range, i18n) : row.original.rangeIri;
        },
      },
      {
        Header: i18n("actions"),
        id: "actions",
        headerClassName: "text-center align-top",
        disableFilters: true,
        disableSortBy: true,
        // @ts-ignore
        Cell: ({ row }) => (
          <>
            <Button
              className="users-action-button"
              color="primary"
              onClick={() => onEditClick(row.original)}
              size="sm"
            >
              {i18n("edit")}
            </Button>
          </>
        ),
        className: "align-middle table-row-actions text-center",
      },
    ],
    [i18n, lang, onEditClick]
  );

  const filterTypes = React.useMemo(
    () => ({ text: multilingualTextContainsFilterFactory(lang) }),
    [lang]
  );
  const tableInstance = useTable<RdfProperty>(
    {
      columns,
      data: properties,
      filterTypes,
      initialState: {
        sortBy: [
          {
            id: "iri",
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
    <PanelWithActions
      title={i18n("administration.customization.customAttributes.title")}
      actions={
        <Link
          id="custom-attributes-create"
          to={Routes.createCustomAttribute.path}
          className="btn btn-primary btn-sm users-action-button"
        >
          <GoPlus />
          &nbsp;
          {i18n("administration.customization.customAttributes.add")}
        </Link>
      }
    >
      <Table instance={tableInstance} />
    </PanelWithActions>
  );
};
