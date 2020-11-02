import * as React from "react";
import VocabularyUtils from "../../../util/VocabularyUtils";
import withInjectableLoading, {InjectsLoading} from "../../hoc/withInjectableLoading";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {loadStatistics as loadStatisticsAction} from "../../../action/AsyncActions";
import Constants from "../../../util/Constants";
import Chart from "react-apexcharts";
import Utils from "../../../util/Utils";

const TYPE_NOT_FILLED = VocabularyUtils.PREFIX + "not-filled";

const STATISTICS_TYPE = "term-type-frequency";

const CHART_OPTIONS = {
    chart: {
        stacked: true,
        stackType: "100%",
        toolbar: {
            show: false
        }
    },
    plotOptions: {
        bar: {
            horizontal: false
        }
    },
    dataLabels: {
        dropShadow: {
            enabled: true
        }
    },
    stroke: {
        width: 0
    },
    xaxis: {
        categories: ["Type"],
        labels: {
            show: false
        },
        axisBorder: {
            show: false
        },
        axisTicks: {
            show: false
        }
    },
    yaxis: {
        show: false,
        reversed: true
    },
    fill: {
        opacity: 1,
        type: "gradient",
        gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.20,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 50, 100]
        }
    },
    grid: {
        show: false
    },
    legend: {
        position: "top",
        horizontalAlign: "center"
    }
};

interface TermTypeFrequencyProps extends HasI18n, InjectsLoading {
    vocabularyIri: string;
    loadStatistics: (vocabularyIri: string) => Promise<any>;
}

export const TermTypeFrequency: React.FC<TermTypeFrequencyProps> = props => {
    const {vocabularyIri, loadStatistics, i18n} = props;
    const [data, setData] = React.useState<any>(null);
    React.useEffect(() => {
        if (vocabularyIri !== Constants.EMPTY_ASSET_IRI) {
            loadStatistics(vocabularyIri).then(result => setData(result));
        }
    }, [loadStatistics, vocabularyIri]);

    if (!data) {
        return <div>{props.renderMask()}</div>;
    }

    const series = (data as object[]).map((d: any) => ({
        name: d["@id"] === TYPE_NOT_FILLED ? i18n("statistics.notFilled") : d[VocabularyUtils.RDFS_LABEL],
        data: [d[VocabularyUtils.HAS_COUNT]]
    }));
    const options: any = Object.assign({}, CHART_OPTIONS);
    options.xaxis.categories = [i18n("term.metadata.types")];
    return <Chart options={options}
                  series={series}
                  type="bar"
                  width="100%"
                  height={Utils.calculateAssetListHeight() + 88}/>;
};


export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadStatistics: (vocabularyIri: string) => dispatch(loadStatisticsAction(STATISTICS_TYPE, {vocabulary: vocabularyIri}))
    };
})(withInjectableLoading(injectIntl(withI18n(TermTypeFrequency))));
