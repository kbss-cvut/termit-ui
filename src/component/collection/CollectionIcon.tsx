import { FunctionComponent } from "react";
import { useI18n } from "../hook/useI18n";
import { UncontrolledTooltip } from "reactstrap";
import { FaThList } from "react-icons/fa";

export const CollectionIcon: FunctionComponent<{ id: string }> = ({ id }) => {
  const { i18n } = useI18n();
  const targetId = id + "CollectionIcon";
  return (
    <>
      <FaThList id={targetId} size={"1em"} style={{ marginRight: "0.5em" }} />
      <UncontrolledTooltip target={targetId} placement={"top"}>
        {i18n("collection.title")}
      </UncontrolledTooltip>
    </>
  );
};
