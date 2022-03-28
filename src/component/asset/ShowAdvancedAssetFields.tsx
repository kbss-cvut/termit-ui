import * as React from "react";
import { useState } from "react";
import { Button, Collapse } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import classNames from "classnames";

/**
 * "Show Advanced" component.
 *
 * It wraps components that are shown in advanced regime only.
 */
export const ShowAdvancedAssetFields: React.FC = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const { children } = props;
  const { i18n } = useI18n();
  return (
    <>
      <Button
        color="link"
        id="toggle-advanced"
        onClick={toggle}
        className={classNames({ "mb-3": !isOpen })}
      >
        {i18n(
          isOpen
            ? "asset.create.hideAdvancedSection"
            : "asset.create.showAdvancedSection"
        )}
      </Button>
      <Collapse isOpen={isOpen}>{children}</Collapse>
    </>
  );
};

export default ShowAdvancedAssetFields;
