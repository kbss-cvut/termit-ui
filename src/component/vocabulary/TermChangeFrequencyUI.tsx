import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { Col, Row, Table } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import AggregatedChangeInfo from "../../model/changetracking/AggregatedChangeInfo";
import VocabularyUtils from "../../util/VocabularyUtils";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import { UpdateRecord } from "../../model/changetracking/UpdateRecord";
import VocabularyContentPersistRow from "../changetracking/VocabularyContentPersistRow";
import VocabularyContentUpdateRow from "../changetracking/VocabularyContentUpdateRow";
import SimplePagination from "../dashboard/widget/lastcommented/SimplePagination";
import CustomInput from "../misc/CustomInput";
import Select from "../misc/Select";
import "./TermChangeFrequencyUI.scss";
import PersistRecord from "../../model/changetracking/PersistRecord";
import DeleteRecord from "../../model/changetracking/DeleteRecord";
import VocabularyContentDeleteRow from "../changetracking/VocabularyContentDeleteRow";
import { debounce } from "lodash";
import Constants from "../../util/Constants";
import { VocabularyContentChangeFilterData } from "../../model/filter/VocabularyContentChangeFilterData";

interface TermChangeFrequencyUIProps {
  aggregatedRecords: AggregatedChangeInfo[] | null;
  changeRecords: ChangeRecord[] | null;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  applyFilter: (filterData: VocabularyContentChangeFilterData) => void;
}

/**
 * Partial specification of ApexCharts locale (https://apexcharts.com/docs/localization/).
 * Should be enough for our case.
 */
const CZ_LOCALE = {
  name: "cs-CZ",
  options: {
    months: [
      "Leden",
      "Únor",
      "Březen",
      "Duben",
      "Květen",
      "Červen",
      "Červenec",
      "Srpen",
      "Září",
      "Říjen",
      "Listopad",
      "Prosinec",
    ],
    shortMonths: [
      "Led",
      "Úno",
      "Bře",
      "Dub",
      "Kvě",
      "Čvn",
      "Čvc",
      "Srp",
      "Zář",
      "Říj",
      "Lis",
      "Pro",
    ],
  },
};

const TermChangeFrequencyUI: React.FC<TermChangeFrequencyUIProps> = ({
  aggregatedRecords,
  changeRecords,
  page,
  setPage,
  pageSize,
  applyFilter,
}) => {
  const { i18n, locale } = useI18n();

  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterTerm, setFilterTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAttribute, setFilterAttribute] = useState("");
  const applyFilterDebounced = useRef(
    debounce(applyFilter, Constants.INPUT_DEBOUNCE_WAIT_TIME)
  );

  useEffect(() => {
    applyFilterDebounced.current({
      author: filterAuthor,
      term: filterTerm,
      changeType: filterType,
      attribute: filterAttribute,
    });
  }, [
    filterAuthor,
    filterTerm,
    filterType,
    filterAttribute,
    applyFilterDebounced,
  ]);

  if (!aggregatedRecords) {
    return <div className="additional-metadata-container">&nbsp;</div>;
  }

  if (aggregatedRecords.length === 0) {
    return (
      <div
        id="history-empty-notice"
        className="additional-metadata-container italics"
      >
        {i18n("history.empty")}
      </div>
    );
  }

  const dates = Array.from(new Set(aggregatedRecords.map((r) => r.getDate())));
  const termCreations = aggregatedRecords.filter(
    (r) => r.types.indexOf(VocabularyUtils.PERSIST_EVENT) !== -1
  );
  const termUpdates = aggregatedRecords.filter(
    (r) => r.types.indexOf(VocabularyUtils.UPDATE_EVENT) !== -1
  );
  const termDeletions = aggregatedRecords.filter(
    (r) => r.types.indexOf(VocabularyUtils.DELETE_EVENT) !== -1
  );

  const options = {
    chart: {
      defaultLocale: locale,
      locales: [CZ_LOCALE, { name: "en" }],
      id: "vocabularyFrequency",
      stacked: true,
      zoom: {
        enabled: false,
        type: "x",
        autoScaleYaxis: true,
        autoScaleXaxis: true,
      },
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "10%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    legend: {
      position: "right",
    },
    xaxis: {
      categories: dates,
      min: dates[0],
      max: dates[dates.length - 1],
      type: "datetime",
    },
    yaxis: {
      labels: {
        formatter: (x: number) => Math.abs(Math.round(x)),
      },
      title: {
        text: i18n("vocabulary.termchanges.termcount"),
      },
    },
  };

  const series = [
    {
      name: i18n("vocabulary.termchanges.creations"),
      type: "column",
      data: termCreations.map((a) => [a.getDate(), a.count]),
      color: "var(--primary)",
    },
    {
      name: i18n("vocabulary.termchanges.updates"),
      type: "column",
      data: termUpdates.map((a) => [a.getDate(), a.count]),
      color: "var(--info)",
    },
    {
      name: i18n("vocabulary.termchanges.deletions"),
      type: "column",
      data: termDeletions.map((a) => [a.getDate(), a.count]),
      color: "var(--danger)",
    },
  ];
  return (
    <Row>
      <Col xl={6} lg={12}>
        <Chart options={options} series={series} width="100%" />
      </Col>
      <Col xl={6} lg={12} className={"border-left"}>
        <div className="additional-metadata-container">
          <Table striped={true} responsive={true}>
            <thead>
              <tr>
                <th className="col-3">{i18n("history.whenwho")}</th>
                <th className="col-3">{i18n("type.term")}</th>
                <th className="col-2">{i18n("history.type")}</th>
                <th className="col">{i18n("history.changedAttribute")}</th>
              </tr>
              <tr>
                <td>
                  <CustomInput
                    name={i18n("asset.author")}
                    placeholder={i18n("asset.author")}
                    value={filterAuthor}
                    onChange={(e) => setFilterAuthor(e.target.value)}
                  />
                </td>
                <td>
                  <CustomInput
                    name={i18n("type.term")}
                    placeholder={i18n("type.term")}
                    value={filterTerm}
                    onChange={(e) => setFilterTerm(e.target.value)}
                  />
                </td>
                <td>
                  <Select
                    placeholder={i18n("history.type")}
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value={""}></option>
                    {[
                      "history.type.persist",
                      "history.type.update",
                      "history.type.delete",
                    ].map((type) => (
                      <option key={type} value={type}>
                        {i18n(type)}
                      </option>
                    ))}
                  </Select>
                </td>
                <td>
                  <CustomInput
                    name={i18n("history.changedAttribute")}
                    placeholder={i18n("history.changedAttribute")}
                    value={filterAttribute}
                    onChange={(e) => setFilterAttribute(e.target.value)}
                  />
                </td>
              </tr>
            </thead>
            <tbody>
              {changeRecords?.map((r) => {
                if (r instanceof PersistRecord) {
                  return <VocabularyContentPersistRow key={r.iri} record={r} />;
                }
                if (r instanceof UpdateRecord) {
                  return <VocabularyContentUpdateRow key={r.iri} record={r} />;
                }
                if (r instanceof DeleteRecord) {
                  return <VocabularyContentDeleteRow key={r.iri} record={r} />;
                }
                return null;
              })}
            </tbody>
          </Table>
        </div>
        <SimplePagination
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          itemCount={pageSize + 1}
        />
      </Col>
    </Row>
  );
};

export default TermChangeFrequencyUI;
