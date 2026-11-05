import { FunctionComponent } from "react";
import { useI18n } from "../hook/useI18n";
import { UncontrolledTooltip } from "reactstrap";
import { FaList } from "react-icons/fa6";
import { OrderedCollectionIcon } from "./OrderedCollectionIcon";

import "./CollectionIcon.scss";

export const CollectionIcon: FunctionComponent<{
  id: string;
  isOrdered?: boolean;
}> = ({ id, isOrdered = false }) => {
  const { i18n } = useI18n();
  const targetId = id + "CollectionIcon";

  if (isOrdered) {
    return <OrderedCollectionIcon id={id} />;
  }
  return (
    <>
      <FaList id={targetId} size={"1em"} className={"skos-collection-icon"} />
      <UncontrolledTooltip target={targetId} placement={"top"}>
        {i18n("collection.title")}
      </UncontrolledTooltip>
    </>
  );
};
