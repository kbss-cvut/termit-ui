import * as React from "react";
import { useRef, useState } from "react";
import Asset, { AssetData } from "../../model/Asset";
import ChangeRecord from "../../model/changetracking/ChangeRecord";
import { Table } from "reactstrap";
import { useDispatch } from "react-redux";
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
import CustomInput from "../misc/CustomInput";
import Select from "../misc/Select";
import DeleteRecord from "../../model/changetracking/DeleteRecord";
import DeleteRow from "./DeleteRow";
import { debounce } from "lodash";
import { VocabularyContentChangeFilterData } from "../../model/filter/VocabularyContentChangeFilterData";
import SimplePagination from "../dashboard/widget/lastcommented/SimplePagination";

interface AssetHistoryProps {
  asset: Asset;
}

export const AssetHistory: React.FC<AssetHistoryProps> = ({ asset }) => {
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [records, setRecords] = React.useState<null | ChangeRecord[]>(null);
  const [filterAuthor, setFilterAuthor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterAttribute, setFilterAttribute] = useState("");

  const [page, setPage] = useState(0);
  const pageSize = Constants.VOCABULARY_CONTENT_HISTORY_LIMIT;

  const loadHistoryActionDebounced = useRef(
    debounce(
      (
        asset: Asset,
        filterData: VocabularyContentChangeFilterData,
        cb: (records?: ChangeRecord[]) => void
      ) => dispatch(loadHistoryAction(asset, filterData)).then(cb),
      Constants.INPUT_DEBOUNCE_WAIT_TIME
    )
  );

  React.useEffect(() => {
    if (asset.iri === Constants.EMPTY_ASSET_IRI) {
      return;
    }
    const filter = {
      author: filterAuthor,
      term: "",
      changeType: filterType,
      attribute: filterAttribute,
    };

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
      loadHistoryActionDebounced.current(
        modifiedAsset as Asset,
        filter,
        (recs) => {
          if (recs) {
            //Show history which is relevant to the snapshot
            const filteredRecs = recs.filter(
              (r) => Date.parse(r.timestamp) < snapshotTimeCreated
            );
            setRecords(filteredRecs);
          }
        }
      );
    } else {
      loadHistoryActionDebounced.current(asset, filter, (recs) => {
        if (recs) {
          setRecords(recs);
        }
      });
    }
  }, [
    asset,
    dispatch,
    filterAuthor,
    filterType,
    filterAttribute,
    loadHistoryActionDebounced,
  ]);

  React.useEffect(() => {
    setPage(0);
  }, [asset, filterAuthor, filterType, filterAttribute]);

  React.useEffect(() => {
    if (!records) return;

    const maxPageIndex =
      records.length === 0 ? 0 : Math.floor((records.length - 1) / pageSize);

    // Current page is out of range after filtering
    if (page > maxPageIndex) {
      setPage(maxPageIndex);
    }
  }, [records, page, pageSize]);

  if (!records) {
    return <ContainerMask text={i18n("history.loading")} />;
  }

  const start = page * pageSize;
  const end = start + pageSize;
  const pageRecords = records.slice(start, end);

  return (
    <div className="additional-metadata-container">
      <Table striped={true} responsive={true}>
        <thead>
          <tr>
            <th className="col-2">{i18n("history.whenwho")}</th>
            <th className="col-1">{i18n("history.type")}</th>
            <th className="col-2">{i18n("history.changedAttribute")}</th>
            <th className="col-2">{i18n("history.originalValue")}</th>
            <th className="col-2">{i18n("history.newValue")}</th>
          </tr>
          <tr>
            <td>
              <CustomInput
                name={i18n("asset.author")}
                placeholder={i18n("asset.author")}
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
              />
            </td>
            <td>
              <Select
                placeholder={i18n("history.type")}
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value={""}></option>
                {[
                  "history.type.persist",
                  "history.type.update",
                  "history.type.delete",
                ].map((type) => (
                  <option key={type} value={type}>
                    {i18n(type)}
                  </option>
                ))}
              </Select>
            </td>
            <td>
              <CustomInput
                name={i18n("history.changedAttribute")}
                placeholder={i18n("history.changedAttribute")}
                value={filterAttribute}
                onChange={(e) => setFilterAttribute(e.target.value)}
              />
            </td>
          </tr>
        </thead>
        <tbody>
          {pageRecords.map((r) => {
            if (r instanceof PersistRecord) {
              return <PersistRow key={r.iri} record={r} />;
            }
            if (r instanceof UpdateRecord) {
              return <UpdateRow key={r.iri} record={r} />;
            }
            if (r instanceof DeleteRecord) {
              return <DeleteRow key={r.iri} record={r} />;
            }
            return null;
          })}
        </tbody>
      </Table>
      {records.length > pageSize || page > 0 ? (
        <SimplePagination
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          itemCount={pageRecords.length}
        />
      ) : null}
    </div>
  );
};

export default AssetHistory;
