import * as React from "react";
import { Label, Table } from "reactstrap";
import AssetLabel from "../misc/AssetLabel";
import OutgoingLink from "../misc/OutgoingLink";
import Utils from "../../util/Utils";
import { useI18n } from "../hook/useI18n";
import "./UnmappedProperties.scss";

declare type PropertyValueType = { iri: string } | string;

interface UnmappedPropertiesProps {
  properties: Map<string, PropertyValueType[]>;
  showInfoOnEmpty?: boolean;
}

const UnmappedProperties: React.FC<UnmappedPropertiesProps> = (
  props: UnmappedPropertiesProps
) => {
  const { i18n } = useI18n();
  if (props.properties.size === 0) {
    return props.showInfoOnEmpty ? (
      <div className="additional-metadata-container italics">
        {i18n("properties.empty")}
      </div>
    ) : null;
  }
  const result: JSX.Element[] = [];
  props.properties.forEach((values, k) => {
    const sortedItems = values.map((v) =>
      (v as { iri: string }).iri ? (v as { iri: string }).iri : (v as string)
    );
    sortedItems.sort(Utils.localeComparator);
    const items = (
      <ul>
        {sortedItems.map((v: string) => (
          <li key={Utils.hashCode(v)}>{v}</li>
        ))}
      </ul>
    );
    result.push(
      <tr key={k}>
        <td>
          <OutgoingLink
            label={
              <Label className="attribute-label" title={k}>
                <AssetLabel iri={k} shrinkFullIri={true} />
              </Label>
            }
            iri={k}
          />
        </td>
        <td>{items}</td>
      </tr>
    );
  });
  return (
    <Table striped={true} className="mt-3">
      <thead>
        <tr>
          <th>{i18n("properties.edit.property")}</th>
          <th>{i18n("properties.edit.value")}</th>
        </tr>
      </thead>
      <tbody>{result}</tbody>
    </Table>
  );
};

UnmappedProperties.defaultProps = {
  showInfoOnEmpty: false,
};

export default UnmappedProperties;
