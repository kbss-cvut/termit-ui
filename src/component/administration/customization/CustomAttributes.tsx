import React from "react";
import { useI18n } from "../../hook/useI18n";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch, useSelector } from "react-redux";
import { getCustomAttributes } from "../../../action/AsyncActions";
import PanelWithActions from "../../misc/PanelWithActions";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { CustomAttribute } from "../../../model/RdfsResource";
import TermItState from "../../../model/TermItState";
import { multilingualTextContainsFilterFactory } from "../../misc/table/TextBasedFilter";
import { getShortLocale } from "../../../util/IntlUtil";
import { getLocalized } from "../../../model/MultilingualString";
import { Button } from "reactstrap";
import Table from "../../misc/table/Table";
import { GoPlus } from "react-icons/go";
import { Link } from "react-router-dom";
import {
  DOMAIN_OPTIONS,
  getSelectorOptionLabel,
  RANGE_OPTIONS,
} from "./CustomAttributeSelector";
import Routing from "../../../util/Routing";
import Routes from "../../../util/Routes";
import VocabularyUtils from "../../../util/VocabularyUtils";
import CopyIriIcon from "../../misc/CopyIriIcon";

export const CustomAttributes: React.FC = () => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const properties = useSelector(
    (state: TermItState) => state.customAttributes
  );

  React.useEffect(() => {
    dispatch(getCustomAttributes());
  }, [dispatch]);

  const onEditClick = React.useCallback((property: CustomAttribute) => {
    Routing.transitionTo(Routes.editCustomAttribute, {
      params: new Map<string, string>([
        ["name", VocabularyUtils.create(property.iri).fragment],
      ]),
    });
  }, []);

  const lang = getShortLocale(locale);
  const columns: ColumnDef<CustomAttribute>[] = React.useMemo(
    () => [
      {
        header: i18n("properties.edit.new.label"),
        accessorKey: "label",
        filterFn: multilingualTextContainsFilterFactory(lang),
        cell: ({ row }) => (
          <>
            {row.original.getLabel(lang)}
            <CopyIriIcon url={row.original.iri} />
          </>
        ),
        meta: { className: "align-middle" },
      },
      {
        header: i18n("properties.edit.new.comment"),
        accessorKey: "comment",
        filterFn: multilingualTextContainsFilterFactory(lang),
        cell: ({ row }) => <>{getLocalized(row.original.comment, lang)}</>,
        meta: { className: "align-middle" },
      },
      {
        header: i18n("administration.customization.customAttributes.domain"),
        accessorKey: "domainIri",
        enableColumnFilter: false,
        enableSorting: false,
        meta: { className: "align-middle" },
        cell: ({ row }) => {
          const domain = DOMAIN_OPTIONS.find(
            (opt) => opt.value === row.original.domainIri
          );
          return domain
            ? getSelectorOptionLabel(domain, i18n)
            : row.original.domainIri;
        },
      },
      {
        header: i18n("administration.customization.customAttributes.range"),
        accessorKey: "rangeIri",
        enableColumnFilter: false,
        enableSorting: false,
        meta: { className: "align-middle" },
        cell: ({ row }) => {
          const range = RANGE_OPTIONS.find(
            (opt) => opt.value === row.original.rangeIri
          );
          return range
            ? getSelectorOptionLabel(range, i18n)
            : row.original.rangeIri;
        },
      },
      {
        header: i18n("actions"),
        id: "actions",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => (
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
        meta: {
          headerClassName: "text-center align-top",
          className: "align-middle table-row-actions text-center",
        },
      },
    ],
    [i18n, lang, onEditClick]
  );

  const tableInstance = useReactTable<CustomAttribute>({
    columns,
    data: properties,
    initialState: {
      sorting: [
        {
          id: "label",
          desc: false,
        },
      ],
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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
