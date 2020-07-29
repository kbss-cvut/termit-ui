import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Asset from "../../model/Asset";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import {Table} from "reactstrap";
import {connect} from "react-redux";
import {injectIntl} from "react-intl";
import {ThunkDispatch} from "../../util/Types";
import {loadHistory} from "../../action/AsyncActions";
import {UpdateRecord} from "../../model/changetracking/UpdateRecord";
import UpdateRow from "./UpdateRow";
import PersistRow from "./PersistRow";
import PersistRecord from "../../model/changetracking/PersistRecord";
import ContainerMask from "../misc/ContainerMask";
import Constants from "../../util/Constants";

interface AssetHistoryProps extends HasI18n {
    asset: Asset;

    loadHistory: (asset: Asset) => Promise<ChangeRecord[]>;
}

export const AssetHistory: React.FC<AssetHistoryProps> = props => {
    const {asset} = props;
    const [records, setRecords] = React.useState<null | ChangeRecord[]>(null);
    React.useEffect(() => {
        if (asset.iri !== Constants.EMPTY_ASSET_IRI) {
            props.loadHistory(asset).then(recs => setRecords(recs));
        }
    }, [asset]);
    const i18n = props.i18n;
    if (!records) {
        return <ContainerMask text={i18n("history.loading")}/>;
    }
    if (records.length === 0) {
        return <div id="history-empty-notice" className="additional-metadata-container italics">
            {i18n("history.empty")}
        </div>;
    }
    return <div className="additional-metadata-container">
        <Table striped={true}>
            <thead>
            <tr>
                <th className="col-xs-2">{i18n("history.whenwho")}</th>
                <th className="col-xs-1">{i18n("history.type")}</th>
                <th className="col-xs-2">{i18n("history.changedAttribute")}</th>
                <th className="col-xs-2">{i18n("history.originalValue")}</th>
                <th className="col-xs-2">{i18n("history.newValue")}</th>
            </tr>
            </thead>
            <tbody>
            {records.map(r => r instanceof UpdateRecord ?
                <UpdateRow key={r.iri} record={r as UpdateRecord}/> :
                <PersistRow key={r.iri} record={r as PersistRecord}/>)}
            </tbody>
        </Table>
    </div>;
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        loadHistory: (asset: Asset) => dispatch(loadHistory(asset))
    };
})(injectIntl(withI18n(AssetHistory)));
