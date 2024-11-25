import * as React from "react";
import { FormattedDate, FormattedTime } from "react-intl";
import AssetLabel from "../misc/AssetLabel";
import { Badge } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { UpdateRowProps } from "./UpdateRow";
import TermIriLink from "../term/TermIriLink";

export const VocabularyContentUpdateRow: React.FC<UpdateRowProps> = (props) => {
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
        <TermIriLink iri={record.changedEntity.iri} shrinkFullIri={true} />
      </td>
      <td>
        <Badge color="secondary">{i18n(record.typeLabel)}</Badge>
      </td>
      <td>
        <AssetLabel iri={record.changedAttribute.iri} />
      </td>
    </tr>
  );
};

export default VocabularyContentUpdateRow;
