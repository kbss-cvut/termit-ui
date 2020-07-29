import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {Card, CardBody, CardHeader} from "reactstrap";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../../util/Types";
import {loadMyAssets} from "../../../action/AsyncActions";
import withInjectableLoading, {InjectsLoading} from "../../hoc/withInjectableLoading";
import TermItState from "../../../model/TermItState";
import AssetList from "./AssetList";
import RecentlyModifiedAsset from "../../../model/RecentlyModifiedAsset";

interface MyAssetsProps extends HasI18n, InjectsLoading {
    loadAssets: () => Promise<RecentlyModifiedAsset[]>;
    locale: string;
}

interface MyAssetsState {
    assets: RecentlyModifiedAsset[];
}

export class MyAssets extends React.Component<MyAssetsProps, MyAssetsState> {
    constructor(props: MyAssetsProps) {
        super(props);
        this.state = {assets: []};
    }

    public componentDidMount(): void {
        this.props.loadingOn();
        this.props.loadAssets().then((result: RecentlyModifiedAsset[]) => {
            this.setState({assets: result});
            this.props.loadingOff();
        });
    }

    public render() {
        const i18n = this.props.i18n;
        return <Card>
            <CardHeader tag="h4" color="primary">
                {i18n("dashboard.widget.myAssets.title")}
            </CardHeader>
            <CardBody className="py-0">
                {this.props.renderMask()}
                <AssetList assets={this.state.assets} loading={this.props.loading}/>
            </CardBody>
        </Card>;
    }
}

export default connect((state: TermItState) => {
    return {
        locale: state.intl.locale
    };
}, (dispatch: ThunkDispatch) => {
    return {
        loadAssets: () => dispatch(loadMyAssets())
    };
})(injectIntl(withI18n(withInjectableLoading(MyAssets))));

