import * as React from "react";
import Chart from "react-apexcharts";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {default as Routes} from "../../../util/Routes";
import RoutingI from "../../../util/Routing";
import withInjectableLoading, {InjectsLoading} from "../../hoc/withInjectableLoading";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {loadStatistics as loadStatisticsAction} from "../../../action/AsyncActions";

interface Props extends HasI18n, InjectsLoading {
    loadStatistics: () => Promise<any>;
}

const STATISTICS_TYPE = "term-frequency";

const TermFrequency: React.FC<Props> = (props) => {
    const {loadStatistics} = props;
    const [queryResult, setQueryResult] = React.useState<any>(null);
    React.useEffect(() => {
        loadStatistics().then(data => setQueryResult(data));
    }, [loadStatistics]);
    if (!queryResult) {
        return <div>{props.renderMask()}</div>;
    }

    const vocabularies = {};
    queryResult.forEach((r: any) => {
        const label = r[VocabularyUtils.RDFS_LABEL];
        const value = r[VocabularyUtils.HAS_COUNT];
        vocabularies[r["@id"]] = {value, label};
    });

    const vocList: { id: string, label: string, value: number }[] = Object.keys(vocabularies).map(key => (
        {
            id: key,
            label: vocabularies[key].label,
            value: parseInt(vocabularies[key].value, 10)
        })
    );

    const total = vocList.reduce((a, b) => a + b.value, 0);

    const sortOutedList = vocList.filter(t => (t.value / total >= 0.025));

    const othersTotal = total - sortOutedList.reduce((a, b) => a + b.value, 0);

    sortOutedList.push({
        id: "",
        label: "Others",
        value: othersTotal
    });

    const options = {
        legend: {
            show: false
        },
        colors: ["#2bffc6", "#ffd600", "#29AB87", "#f3a4b5", "#11cdef", "#fb6340", "#5603ad", "#ff6666", "#5e72e4", "#8965e0"],
        plotOptions: {
            pie: {
                donut: {
                    labels: {
                        show: true,
                        total: {
                            showAlways: true,
                            show: true,
                            label: props.i18n("dashboard.widget.donut.total-terms"),
                        }
                    }
                }
            }
        },
        labels: sortOutedList.map(t => t.label),
        donut: {
            total: {
                show: true,

            }
        },
        chart: {
            events: {
                dataPointSelection(event: any, chartContext: any, config: any) {
                    const voc = sortOutedList[config.dataPointIndex];

                    if (voc.id === "") {
                        return;
                    }

                    const iri = VocabularyUtils.create(voc.id);

                    RoutingI.transitionTo(Routes.vocabularyDetail, {
                        params: new Map([["name", iri.fragment || ""]]),
                        query: new Map([["namespace", iri.namespace || ""]])
                    });
                }
            }
        }
    };

    return <>
        {props.renderMask()}
        <Chart
            options={options}
            type="donut"
            series={sortOutedList.map(t => t.value)}
            width="100%"
            height="auto"/>
    </>;
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadStatistics: () => dispatch(loadStatisticsAction(STATISTICS_TYPE))
    };
})(withInjectableLoading(injectIntl(withI18n(TermFrequency))));
