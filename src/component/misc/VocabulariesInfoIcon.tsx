import React, { useState } from "react";
import classNames from "classnames";
import { FaInfoCircle } from "react-icons/fa";
import { Button, Popover, PopoverBody, PopoverHeader } from "reactstrap";
import { VocabularyData } from "../../model/Vocabulary";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import { useI18n } from "../hook/useI18n";
import "./InfoIcon.scss";

interface VocabulariesInfoIconProps {
  id: string;
  vocabularies: VocabularyData[];
  labelKey?: string;
  className?: string;
}

const VocabulariesInfoIcon: React.FC<VocabulariesInfoIconProps> = ({
  id,
  vocabularies,
  labelKey = "vocabulary.detail.related",
  className,
}) => {
  const cls = classNames("info-icon", "help-icon", className);
  const { i18n, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);

  const show = () => setOpen(true);
  const mouseOut = () => {
    if (!pinned) {
      setOpen(false);
    }
  };
  const onClick = () => {
    setOpen(!pinned);
    setPinned(!pinned);
  };

  if (!vocabularies || vocabularies.length === 0) {
    return null;
  }

  return (
    <>
      <FaInfoCircle
        id={id}
        className={cls}
        onClick={onClick}
        onMouseOver={show}
        onMouseOut={mouseOut}
      />
      <Popover
        target={id}
        placement="bottom"
        isOpen={open}
        popperClassName="help-icon-popover"
      >
        <PopoverHeader>
          {i18n(labelKey as any)}
          <Button onClick={onClick} close={true} className="mt-1" />
        </PopoverHeader>
        <PopoverBody>
          <ul className="text-left mb-0 pl-3">
            {vocabularies.map((v) => (
              <li key={v.iri}>
                {getLocalized(v.label, getShortLocale(locale))}
              </li>
            ))}
          </ul>
        </PopoverBody>
      </Popover>
    </>
  );
};

export default VocabulariesInfoIcon;
