import IdentifierChangeRecord from "../../model/changetracking/IdentifierChangeRecord";
import { useI18n } from "../hook/useI18n";
import { FormattedDate, FormattedTime } from "react-intl";
import { Badge } from "reactstrap";
import * as React from "react";
import OutgoingLink from "../misc/OutgoingLink";
import AssetLabel from "../misc/AssetLabel";
import { HasIdentifier } from "../../model/Asset";

export interface IdentifierChangeRowProps {
  record: IdentifierChangeRecord;
}

export const IdentifierChangeRow: React.FC<IdentifierChangeRowProps> = ({
  record,
}) => {
  const { i18n } = useI18n();
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
      <td></td>
      <td>{renderIdentifier(record.originalValue)}</td>
      <td>{renderIdentifier(record.changedEntity)}</td>
      <td></td>
    </tr>
  );
};

function renderIdentifier(hasIri: HasIdentifier) {
  return (
    <OutgoingLink label={<AssetLabel iri={hasIri.iri} />} iri={hasIri.iri} />
  );
}
