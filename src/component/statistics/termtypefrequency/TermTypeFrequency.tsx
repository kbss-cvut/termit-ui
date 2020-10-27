import * as React from "react";
import VocabularyUtils from "../../../util/VocabularyUtils";
import withInjectableLoading, {InjectsLoading} from "../../hoc/withInjectableLoading";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {loadStatistics as loadStatisticsAction} from "../../../action/AsyncActions";
import Chart from "react-apexcharts";

// const TYPE_NOT_FILLED = VocabularyUtils.PREFIX + "not-filled";

const STATISTICS_TYPE = "term-frequency";

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
            horizontal: true
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
    fill: {
        opacity: 1,
        type: "gradient",
        gradient: {
            shade: "dark",
            type: "vertical",
            shadeIntensity: 0.35,
            gradientToColors: undefined,
            inverseColors: false,
            opacityFrom: 0.85,
            opacityTo: 0.85,
            stops: [90, 0, 100]
        }
    },

    legend: {
        position: "bottom",
        horizontalAlign: "right"
    }
};

interface TermTypeFrequencyProps extends HasI18n, InjectsLoading {
    vocabularyIri: string;
    loadStatistics: (vocabularyIri: string) => Promise<any>;
}

export const TermTypeFrequency: React.FC<TermTypeFrequencyProps> = props => {
    const {vocabularyIri, loadStatistics} = props;
    const [data, setData] = React.useState<any>(null);
    React.useEffect(() => {
        loadStatistics(vocabularyIri).then(result => setData(result));
    }, [loadStatistics, vocabularyIri]);

    if (!data) {
        return <div>{props.renderMask()}</div>;
    }

    const series = (data as object[]).map((d: any) => ({
        name: d[VocabularyUtils.RDFS_LABEL],
        data: [d[VocabularyUtils.HAS_COUNT]]
    }));
    return <Chart options={CHART_OPTIONS}
                  series={series}
                  type="bar"
                  width="100%"
                  height="40px"/>;
};


export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadStatistics: (vocabularyIri: string) => dispatch(loadStatisticsAction(STATISTICS_TYPE, {vocabulary: vocabularyIri}))
    };
})(withInjectableLoading(injectIntl(withI18n(TermTypeFrequency))));
