import * as React from "react";
import SparqlWidget, {PublicProps} from "../SparqlWidget";
import LD from "ld-query";
import VocabularyUtils from "../../../util/VocabularyUtils";
import withInjectableLoading from "../../hoc/withInjectableLoading";

class AssetCount extends React.Component<PublicProps> {
    public render() {
        const context = LD({"termit": VocabularyUtils.NS_TERMIT});
        return <h2>{context(this.props.queryResults).query("termit:has-count @value")}</h2>;
    }
}

export default withInjectableLoading(SparqlWidget<PublicProps>(AssetCount));
