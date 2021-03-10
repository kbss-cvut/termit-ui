import * as React from "react";
import {FormattedDate, FormattedTime} from "react-intl";
import PersistRecord from "../../model/changetracking/PersistRecord";
import {Badge} from "reactstrap";
import {useI18n} from "../hook/useI18n";

interface PersistRowProps {
    record: PersistRecord;
}

export const PersistRow: React.FC<PersistRowProps> = props => {
    const {i18n} = useI18n();
    const record = props.record;
    const created = new Date(record.timestamp);
    return <tr>
        <td>
            <div>
                <FormattedDate value={created}/>{" "}
                <FormattedTime value={created}/>
            </div>
            <div className="italics last-edited-message ml-2">
                {record.author.fullName}
            </div>
        </td>
        <td>
            <Badge color="dark">{i18n(record.typeLabel)}</Badge>
        </td>
        <td/>
        <td/>
        <td/>
    </tr>;
};

export default PersistRow;
