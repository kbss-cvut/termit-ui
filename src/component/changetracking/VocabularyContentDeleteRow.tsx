import * as React from "react";
import { FormattedDate, FormattedTime } from "react-intl";
import { Badge } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import TermIriLink from "../term/TermIriLink";
import DeleteRecord from "../../model/changetracking/DeleteRecord";

export interface DeleteRowProps {
  record: DeleteRecord;
}

export const VocabularyContentDeleteRow: React.FC<DeleteRowProps> = (props) => {
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
        <TermIriLink iri={record.changedEntity.iri} />
      </td>
      <td>
        <Badge color="danger">{i18n(record.typeLabel)}</Badge>
      </td>
      <td></td>
    </tr>
  );
};

export default VocabularyContentDeleteRow;
