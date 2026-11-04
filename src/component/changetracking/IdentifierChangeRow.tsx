import * as React from "react";
import { FormattedDate, FormattedTime } from "react-intl";
import { Badge } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import IdentifierChangeRecord from "../../model/changetracking/IdentifierChangeRecord";
import { renderSingleValue } from "./UpdateRow";

export interface IdentifierChangeRowProps {
  record: IdentifierChangeRecord;
}

export const IdentifierChangeRow: React.FC<IdentifierChangeRowProps> = (
  props
) => {
  const { i18n } = useI18n();
  const record = props.record;
  const created = new Date(Date.parse(record.timestamp));
  return (
    <tr>
      <td>
        <div>
          <FormattedDate value={created} /> <FormattedTime value={created} />
        </div>
        <div className="italics last-edited-message ml-2">
          {record.author.fullName}
        </div>
      </td>
      <td>
        <Badge color="secondary">{i18n(record.typeLabel)}</Badge>
      </td>
      <td>{/* no attribute */}</td>
      <td>{renderSingleValue(record.originalIdentifier)}</td>
      <td>{renderSingleValue(record.newIdentifier)}</td>
      <td>{/* no rollback option */}</td>
    </tr>
  );
};

export default IdentifierChangeRow;
