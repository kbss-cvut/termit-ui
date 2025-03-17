import * as React from "react";
import Chart from "react-apexcharts";
import { useDispatch } from "react-redux";
import { useI18n } from "../../hook/useI18n";
import { TermTypeDistributionDto } from "../../../model/statistics/TermTypeDistributionDto";
import { ThunkDispatch } from "../../../util/Types";
import { loadTermTypeDistributionStatistics } from "../../../action/AsyncStatisticsActions";
import { trackPromise } from "react-promise-tracker";
import { getLocalized } from "../../../model/MultilingualString";
import { getShortLocale } from "../../../util/IntlUtil";
import { RdfsResourceData } from "../../../model/RdfsResource";
import PromiseTrackingMask from "../../misc/PromiseTrackingMask";
import { COLORS } from "../StatisticsConstants";

const defaultChartOptions = {
  chart: {
    id: "types",
    stacked: true,
  },
  plotOptions: {
    bar: {
      horizontal: true,
    },
  },
  colors: COLORS,
};

const TermTypeDistribution: React.FC = () => {
  const { i18n, locale } = useI18n();
  const lang = getShortLocale(locale);
  const [data, setData] = React.useState<TermTypeDistributionDto[] | null>(
    null
  );
  const dispatch: ThunkDispatch = useDispatch();

  React.useEffect(() => {
    trackPromise(
      dispatch(loadTermTypeDistributionStatistics()),
      "term-type-distribution"
    ).then((data) => setData(data));
  }, [dispatch]);

  const options = Object.assign({}, defaultChartOptions, {
    xaxis: {
      categories: (data || []).map((item) =>
        getLocalized(item.resource.label, lang)
      ),
    },
  });

  const types = new Map<string, RdfsResourceData>();
  const typeDistribution = new Map<string, Map<string, number>>();
  (data || []).forEach((dto) => {
    const vocMap = new Map<string, number>();
    typeDistribution.set(dto.resource.iri, vocMap);
    dto.typeDistribution.forEach((dt) => {
      types.set(dt.resource.iri, dt.resource);
      vocMap.set(dt.resource.iri, dt.count);
    });
  });

  const series: { name: string; data: number[] }[] = [];
  types.forEach((item) => {
    const dataArr: number[] = [];
    typeDistribution.forEach((value) => {
      dataArr.push(value.get(item.iri) || 0);
    });
    series.push({
      name: getLocalized(item.label, lang),
      data: dataArr,
    });
  });

  let component: React.ReactNode;
  if (!data) {
    return null;
  }
  if (data.length === 0) {
    component = <h4>{i18n("statistics.types.frequency.empty")}</h4>;
  } else {
    // Height is given by the number of vocabularies + a fixed value for the legend
    const height = data.length * 35 + 60;
    component = (
      <Chart
        options={options}
        series={series}
        type="bar"
        width="100%"
        height={`${height}px`}
      />
    );
  }

  return (
    <>
      <PromiseTrackingMask area="term-type-distribution" />
      {component}
    </>
  );
};

export default TermTypeDistribution;
