import * as React from "react";
import { Label, Table } from "reactstrap";
import AssetLabel from "../misc/AssetLabel";
import OutgoingLink from "../misc/OutgoingLink";
import Utils from "../../util/Utils";
import { useI18n } from "../hook/useI18n";
import "./UnmappedProperties.scss";
import {
  PropertyValueType,
  stringifyPropertyValue,
} from "src/model/WithUnmappedProperties";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { FaTrashAlt } from "react-icons/fa";
import BadgeButton from "../misc/BadgeButton";

interface UnmappedPropertiesProps {
  properties: Map<string, PropertyValueType[]>;
  showInfoOnEmpty?: boolean;
  onRemove?: (property: string, value: string) => void;
}

const UnmappedProperties: React.FC<UnmappedPropertiesProps> = ({
  properties,
  showInfoOnEmpty,
  onRemove,
}) => {
  const { i18n } = useI18n();
  const customAttributes = useSelector(
    (state: TermItState) => state.customAttributes
  );
  const actualProperties = Array.from(properties.keys()).filter(
    (p) => customAttributes.findIndex((att) => att.iri === p) === -1
  );
  if (actualProperties.length === 0) {
    return showInfoOnEmpty ? (
      <div className="additional-metadata-container italics">
        {i18n("properties.empty")}
      </div>
    ) : null;
  }
  const result: React.JSX.Element[] = [];
  actualProperties.forEach((k) => {
    const values = properties.get(k)!;
    if (values.length === 0) {
      return;
    }
    const sortedItems = values.map((v) => stringifyPropertyValue(v));
    sortedItems.sort(Utils.localeComparator);
    const items = (
      <ul>
        {sortedItems.map((v: string) => (
          <li key={Utils.hashCode(v)}>
            {Utils.isLink(v) ? <OutgoingLink label={v} iri={v} /> : v}
            {onRemove && (
              <BadgeButton
                color="danger"
                outline={true}
                title={i18n("properties.edit.remove")}
                className="ml-3"
                onClick={() => onRemove(k, v)}
              >
                <FaTrashAlt />
                {i18n("properties.edit.remove.text")}
              </BadgeButton>
            )}
          </li>
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
