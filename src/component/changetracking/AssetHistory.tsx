import * as React from "react";
import Asset, { AssetData } from "../../model/Asset";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import { Table } from "reactstrap";
import { connect } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadHistory as loadHistoryAction } from "../../action/AsyncActions";
import { UpdateRecord } from "../../model/changetracking/UpdateRecord";
import UpdateRow from "./UpdateRow";
import PersistRow from "./PersistRow";
import PersistRecord from "../../model/changetracking/PersistRecord";
import ContainerMask from "../misc/ContainerMask";
import Constants from "../../util/Constants";
import { useI18n } from "../hook/useI18n";
import Vocabulary from "../../model/Vocabulary";
import Term from "../../model/Term";

interface AssetHistoryProps {
  asset: Asset;

  loadHistory: (asset: Asset) => Promise<ChangeRecord[]>;
}

export const AssetHistory: React.FC<AssetHistoryProps> = (props) => {
  const { asset, loadHistory } = props;
  const { i18n } = useI18n();
  const [records, setRecords] = React.useState<null | ChangeRecord[]>(null);
  React.useEffect(() => {
    if (asset.iri !== Constants.EMPTY_ASSET_IRI) {
      //Check if vocabulary/term is a snapshot
      if (
        (asset instanceof Term || asset instanceof Vocabulary) &&
        asset.snapshotOf()
      ) {
        const modifiedAsset: AssetData = {
          iri: asset.snapshotOf(),
          types: asset.types,
        };
        const snapshotTimeCreated = Date.parse(asset.snapshotCreated()!);
        loadHistory(modifiedAsset as Asset).then((recs) => {
          //Show history which is relevant to the snapshot
          const filteredRecs = recs.filter(
            (r) => Date.parse(r.timestamp) < snapshotTimeCreated
          );
          setRecords(filteredRecs);
        });
      } else {
        loadHistory(asset).then((recs) => {
          setRecords(recs);
        });
      }
    }
  }, [asset, loadHistory]);
  if (!records) {
    return <ContainerMask text={i18n("history.loading")} />;
  }
  if (records.length === 0) {
    return (
      <div
        id="history-empty-notice"
        className="additional-metadata-container italics"
      >
        {i18n("history.empty")}
      </div>
    );
  }
  return (
    <div className="additional-metadata-container">
      <Table striped={true} responsive={true}>
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
          {records.map((r) =>
            r instanceof UpdateRecord ? (
              <UpdateRow key={r.iri} record={r as UpdateRecord} />
            ) : (
              <PersistRow key={r.iri} record={r as PersistRecord} />
            )
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
  return {
    loadHistory: (asset: Asset) => dispatch(loadHistoryAction(asset)),
  };
})(AssetHistory);
