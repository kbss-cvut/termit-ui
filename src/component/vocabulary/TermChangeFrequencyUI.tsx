import * as React from "react";
import Chart from "react-apexcharts";
import { Col, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import AggregatedChangeInfo from "../../model/changetracking/AggregatedChangeInfo";
import VocabularyUtils from "../../util/VocabularyUtils";

interface TermChangeFrequencyUIProps {
  records: AggregatedChangeInfo[] | null;
}

const TermChangeFrequencyUI: React.FC<TermChangeFrequencyUIProps> = ({
  records,
}) => {
  const { i18n } = useI18n();
  if (!records) {
    return <div className="additional-metadata-container">&nbsp;</div>;
  }

  if (records.length === 0) {
    return (
      <div
        id="history-empty-notice"
        className="additional-metadata-container italics"
      >
        {i18n("history.empty")}
      </div>
    );
  }

  const dates = new Array(new Set(records.map((r) => r.getDate())));
  const termCreations = records.filter(
    (r) => r.types.indexOf(VocabularyUtils.PERSIST_EVENT) !== -1
  );
  const termUpdates = records.filter(
    (r) => r.types.indexOf(VocabularyUtils.UPDATE_EVENT) !== -1
  );

  const options = {
    chart: {
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
      <Col xl={8} lg={12}>
        <Chart options={options} series={series} width="100%" />
      </Col>
    </Row>
  );
};

export default TermChangeFrequencyUI;
