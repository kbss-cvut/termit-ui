import * as React from "react";
import SparqlWidget, {PublicProps} from "../SparqlWidget";
import Chart from "react-apexcharts";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {default as Routes} from "../../../util/Routes";
import RoutingI from "../../../util/Routing";
import withInjectableLoading from "../../hoc/withInjectableLoading";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";

interface Props extends PublicProps, HasI18n {
    lang: string
}

const TermFrequency: React.FC<Props> = (props) => {
    const queryResult = props.queryResults;
    if (!queryResult || !queryResult.result) {
        return <div>{props.renderMask()}</div>;
    }

    const vocabularies = {};
    queryResult.result.forEach((r: any) => {
        const label = r[VocabularyUtils.RDFS_LABEL][0]["@value"];
        const value = r[VocabularyUtils.HAS_COUNT][0]["@value"];
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

export default withInjectableLoading(SparqlWidget(injectIntl(withI18n(TermFrequency))));
