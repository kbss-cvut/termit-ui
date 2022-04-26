import * as React from "react";
import Chart from "react-apexcharts";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import PersistRecord from "../../model/changetracking/PersistRecord";
import { UpdateRecord } from "../../model/changetracking/UpdateRecord";
import { Col, Row } from "reactstrap";
import { useI18n } from "../hook/useI18n";

interface TermChangeFrequencyUIProps {
  records: ChangeRecord[] | null;
}

const TermChangeFrequencyUI: React.FC<TermChangeFrequencyUIProps> = (props) => {
  const { i18n } = useI18n();
  if (!props.records) {
    return <div className="additional-metadata-container">&nbsp;</div>;
  }

  if (props.records.length === 0) {
    return (
      <div
        id="history-empty-notice"
        className="additional-metadata-container italics"
      >
        {i18n("history.empty")}
      </div>
    );
  }

  const getGroup = (r: ChangeRecord) => {
    const date = new Date(r.timestamp);
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
  };

  const dates = props.records.map((r) => getGroup(r));

  const groupBy = (recs: ChangeRecord[]): any => {
    const grouped = {};
    recs.forEach((r) => {
      const group = getGroup(r);
      if (!(group in grouped)) {
        grouped[group] = [];
      }
      if (!grouped[group].includes(r.changedEntity.iri)) {
        grouped[group].push(r.changedEntity.iri);
      }
    });
    return grouped;
  };

  const minDate = new Date(dates.reduce((a, b) => (a < b ? a : b)));
  const maxDate = new Date(dates.reduce((a, b) => (a > b ? a : b)));
  const minDateMinusDay = new Date(
    minDate.getFullYear(),
    minDate.getMonth(),
    minDate.getDate() - 1
  );
  const maxDateMinusDay = new Date(
    maxDate.getFullYear(),
    maxDate.getMonth(),
    maxDate.getDate() + 1
  );

  const termCreations = groupBy(
    props.records.filter((r) => r instanceof PersistRecord)
  );
  termCreations[minDate.getTime()] = termCreations[minDate.getTime()] || 0;
  termCreations[maxDate.getTime()] = termCreations[maxDate.getTime()] || 0;

  const termUpdates = groupBy(
    props.records.filter((r) => r instanceof UpdateRecord)
  );
  termUpdates[minDate.getTime()] = termUpdates[minDate.getTime()] || 0;
  termUpdates[maxDate.getTime()] = termUpdates[maxDate.getTime()] || 0;

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
      min: minDateMinusDay.getTime(),
      max: maxDateMinusDay.getTime(),
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
      data: Object.keys(termUpdates).map((a) => [
        parseInt(a, 10),
        -1 * termUpdates[a].length,
      ]),
    },
    {
      name: i18n("vocabulary.termchanges.creations"),
      type: "column",
      data: Object.keys(termCreations).map((a) => [
        parseInt(a, 10),
        termCreations[a].length,
      ]),
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
