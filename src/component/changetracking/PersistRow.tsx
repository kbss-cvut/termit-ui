import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {FormattedDate, FormattedTime, injectIntl} from "react-intl";
import PersistRecord from "../../model/changetracking/PersistRecord";
import {Badge} from "reactstrap";

interface PersistRowProps extends HasI18n {
    record: PersistRecord;
}

export const PersistRow: React.FC<PersistRowProps> = props => {
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
            <Badge color="dark">{props.i18n(record.typeLabel)}</Badge>
        </td>
        <td/>
        <td/>
        <td/>
    </tr>;
};

export default injectIntl(withI18n(PersistRow));
