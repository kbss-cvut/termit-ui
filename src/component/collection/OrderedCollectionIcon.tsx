import { UncontrolledTooltip } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { FunctionComponent } from "react";

import "./CollectionIcon.scss";
import { FaListOl } from "react-icons/fa6";

export const OrderedCollectionIcon: FunctionComponent<{ id: string }> = ({
  id,
}) => {
  const { i18n } = useI18n();
  const targetId = id + "OrderedCollectionIcon";
  return (
    <>
      <FaListOl id={targetId} className={"skos-collection-icon"} />
      <UncontrolledTooltip target={targetId} placement={"top"}>
        {i18n("collection.ordered")}
      </UncontrolledTooltip>
    </>
  );
};
