import * as React from "react";
import { FormattedDate, FormattedTime } from "react-intl";
import {
  UpdateRecord,
  UpdateValueType,
} from "../../model/changetracking/UpdateRecord";
import AssetLabel from "../misc/AssetLabel";
import OutgoingLink from "../misc/OutgoingLink";
import { Badge, Label } from "reactstrap";
import { useI18n } from "../hook/useI18n";

interface UpdateRowProps {
  record: UpdateRecord;
}

export const UpdateRow: React.FC<UpdateRowProps> = (props) => {
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
      <td>
        <AssetLabel iri={record.changedAttribute.iri} />
      </td>
      <td>{renderValue(record.originalValue)}</td>
      <td>{renderValue(record.newValue)}</td>
    </tr>
  );
};

function renderValue(value?: UpdateValueType) {
  if (!value) {
    return null;
  }
  if (Array.isArray(value)) {
    sortIfMultilingual(value);
    return (
      <div>
        {value.map((v, i) => (
          <div key={i}>{renderSingleValue(v)}</div>
        ))}
      </div>
    );
  } else {
    return renderSingleValue(value);
  }
}

function sortIfMultilingual(value: any[]) {
  if (value.find((v) => v["@language"])) {
    value.sort((a, b) =>
      (a["@language"] || a).localeCompare(b["@language"] || b)
    );
  }
}

function renderSingleValue(value: any) {
  if ((value as { iri?: string }).iri) {
    const iri = (value as { iri: string }).iri;
    return <OutgoingLink label={<AssetLabel iri={iri} />} iri={iri} />;
  } else if (value["@language"]) {
    return (
      <Label>
        {value["@value"]}
        <sup>{value["@language"]}</sup>
      </Label>
    );
  }
  return <Label>{`${value}`}</Label>;
}

export default UpdateRow;
