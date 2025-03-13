import * as React from "react";
import Chart from "react-apexcharts";
import VocabularyUtils from "../../../util/VocabularyUtils";
import { default as Routes } from "../../../util/Routes";
import RoutingI from "../../../util/Routing";
import { useI18n } from "../../hook/useI18n";
import { trackPromise } from "react-promise-tracker";
import { loadTermDistributionStatistics } from "../../../action/AsyncStatisticsActions";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../../util/Types";
import { DistributionDto } from "../../../model/statistics/DistributionDto";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";

const COLORS = [
  "#1edaa8",
  "#d3bb3a",
  "#29AB87",
  "#f3a4b5",
  "#11cdef",
  "#fb6340",
  "#5603ad",
  "#ff6666",
  "#5e72e4",
  "#8965e0",
];

const TermDistribution: React.FC = () => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [data, setData] = React.useState<DistributionDto[]>([]);

  React.useEffect(() => {
    trackPromise(
      dispatch(loadTermDistributionStatistics()),
      "term-distribution"
    ).then((resp) => setData(resp));
  }, [dispatch]);

  const vocList: { id: string; label: string; value: number }[] = data.map(
    (item) => ({
      id: item.resource.iri,
      label: getLocalized(item.resource.label, getShortLocale(locale)),
      value: item.count,
    })
  );

  const total = vocList.reduce((a, b) => a + b.value, 0);

  const sortOutedList = vocList.filter((t) => t.value / total >= 0.025);

  const othersTotal = total - sortOutedList.reduce((a, b) => a + b.value, 0);

  sortOutedList.push({
    id: "",
    label: "Others",
    value: othersTotal,
  });

  const options = {
    legend: {
      show: false,
    },
    colors: COLORS,
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
              label: i18n("dashboard.widget.donut.total-terms"),
            },
          },
        },
      },
    },
    labels: sortOutedList.map((t) => t.label),
    donut: {
      total: {
        show: true,
      },
    },
    chart: {
      events: {
        dataPointSelection(event: any, chartContext: any, config: any) {
          const voc = sortOutedList[config.dataPointIndex];

          if (voc.id === "") {
            return;
          }

          const iri = VocabularyUtils.create(voc.id);

          RoutingI.transitionTo(Routes.vocabularySummary, {
            params: new Map([["name", iri.fragment || ""]]),
            query: new Map([["namespace", iri.namespace || ""]]),
          });
        },
      },
    },
    tooltip: {
      theme: "light",
    },
  };

  return (
    <>
      <PromiseTrackingMask area="term-distribution" />
      <Chart
        options={options}
        type="donut"
        series={sortOutedList.map((t) => t.value)}
        width="100%"
        height="auto"
      />
    </>
  );
};

export default TermDistribution;
