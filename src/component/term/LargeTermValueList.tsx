import React from "react";
import Term, { TermData, TermInfo } from "../../model/Term";
import { useI18n } from "../hook/useI18n";
import { Button, Collapse } from "reactstrap";
import Utils from "../../util/Utils";
import OutgoingLink from "../misc/OutgoingLink";
import BadgeButton from "../misc/BadgeButton";
import { FaTrashAlt } from "react-icons/fa";
import { MAX_SELECT_THRESHOLD } from "./TermSelector";
import { resolveSelectedIris } from "./TermTreeSelectHelper";

export const LargeTermValueList: React.FC<{
  value: string[] | TermData[] | TermInfo[];
  onChange: (selected: readonly Term[]) => void;
}> = ({ value, onChange }) => {
  const { formatMessage, i18n } = useI18n();
  const [show, setShow] = React.useState(false);

  const onRemove = (toRemove: string) => {
    if (typeof value[0] === "string") {
      onChange(
        (value as string[])
          .filter((v) => v !== toRemove)
          .map((v) => ({ iri: v } as Term))
      );
    } else {
      onChange(
        (value as TermData[])
          .filter((v) => v.iri !== toRemove)
          .map((d) => new Term(d))
      );
    }
  };
  const selected =
    value.length > 0
      ? typeof value[0] === "string"
        ? (value as string[])
        : resolveSelectedIris(value as TermInfo[])
      : (value as string[]);

  return (
    <>
      <Button onClick={() => setShow(!show)} color="link" size="sm">
        {formatMessage(`term.largeValueList.${show ? "open" : "closed"}`, {
          threshold: MAX_SELECT_THRESHOLD,
        })}
      </Button>
      <Collapse isOpen={show}>
        <ul>
          {selected.map((v) => (
            <li key={Utils.hashCode(v)}>
              <OutgoingLink label={v} iri={v} />
              {onRemove && (
                <BadgeButton
                  color="danger"
                  outline={true}
                  title={i18n("properties.edit.remove")}
                  className="ml-3"
                  onClick={() => onRemove(v)}
                >
                  <FaTrashAlt />
                  {i18n("properties.edit.remove.text")}
                </BadgeButton>
              )}
            </li>
          ))}
        </ul>
      </Collapse>
    </>
  );
};
