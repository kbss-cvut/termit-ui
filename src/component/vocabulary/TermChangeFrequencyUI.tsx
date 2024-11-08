import * as React from "react";
import Chart from "react-apexcharts";
import { Col, Row, Table } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import AggregatedChangeInfo from "../../model/changetracking/AggregatedChangeInfo";
import VocabularyUtils from "../../util/VocabularyUtils";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import { UpdateRecord } from "../../model/changetracking/UpdateRecord";
import VocabularyContentPersistRow from "../changetracking/VocabularyContentPersistRow";
import VocabularyContentUpdateRow from "../changetracking/VocabularyContentUpdateRow";
import If from "../misc/If";
import SimplePagination from "../dashboard/widget/lastcommented/SimplePagination";

interface TermChangeFrequencyUIProps {
  aggregatedRecords: AggregatedChangeInfo[] | null;
  changeRecords: ChangeRecord[] | null;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  itemCount: number;
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
  itemCount,
}) => {
  const { i18n, locale } = useI18n();
  if (!aggregatedRecords || !changeRecords) {
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
      name: i18n("vocabulary.termchanges.updates"),
      type: "column",
      data: termUpdates.map((a) => [a.getDate(), -1 * a.count]),
    },
    {
      name: i18n("vocabulary.termchanges.creations"),
      type: "column",
      data: termCreations.map((a) => [a.getDate(), a.count]),
    },
  ];
  return (
    <Row>
      <Col xl={changeRecords.length === 0 ? 5 : 6} lg={12}>
        <Chart options={options} series={series} width="100%" />
      </Col>
      <Col xl={6} lg={12} className={"border-left"}>
        <div className="additional-metadata-container">
          <Table striped={true} responsive={true}>
            <thead>
              <tr>
                <th className="col-3">{i18n("history.whenwho")}</th>
                <th className="col-3">{i18n("type.term")}</th>
                <th className="col-1">{i18n("history.type")}</th>
                <th className="col-2">{i18n("history.changedAttribute")}</th>
              </tr>
            </thead>
            <tbody>
              {changeRecords.map((r) =>
                r instanceof UpdateRecord ? (
                  <VocabularyContentUpdateRow key={r.iri} record={r} />
                ) : (
                  <VocabularyContentPersistRow key={r.iri} record={r} />
                )
              )}
            </tbody>
          </Table>
        </div>
        <If expression={changeRecords.length > 0}>
          <SimplePagination
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            itemCount={itemCount}
          />
        </If>
      </Col>
    </Row>
  );
};

export default TermChangeFrequencyUI;
