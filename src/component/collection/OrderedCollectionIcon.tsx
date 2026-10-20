import { FaSort } from "react-icons/fa";
import { UncontrolledTooltip } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { FunctionComponent } from "react";

export const OrderedCollectionIcon: FunctionComponent<{ id: string }> = ({
  id,
}) => {
  const { i18n } = useI18n();
  const targetId = id + "OrderedCollectionIcon";
  return (
    <>
      <FaSort id={targetId} style={{ verticalAlign: "center" }} />
      <UncontrolledTooltip target={targetId} placement={"top"}>
        {i18n("collection.ordered")}
      </UncontrolledTooltip>
    </>
  );
};
