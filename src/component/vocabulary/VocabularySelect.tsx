import * as React from "react";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import Vocabulary from "../../model/Vocabulary";
import TermItState from "../../model/TermItState";
import { useDispatch, useSelector } from "react-redux";
import { loadVocabularies } from "../../action/AsyncActions";
import Utils from "../../util/Utils";
import { useI18n } from "../hook/useI18n";
import { ThunkDispatch } from "../../util/Types";

interface VocabularySelectProps {
  id?: string;
  vocabulary: Vocabulary | null;
  onVocabularySet: (vocabulary: Vocabulary) => void;
}

const VocabularySelect: React.FC<VocabularySelectProps> = (props) => {
  const { vocabulary, onVocabularySet } = props;
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    if (Object.getOwnPropertyNames(vocabularies).length === 0) {
      dispatch(loadVocabularies());
    }
  });
  const onChange = (vIri: string) => onVocabularySet(vocabularies[vIri]);
  const { i18n } = useI18n();

  const items = Object.keys(vocabularies || []).map((vIri) => {
    return (
      <DropdownItem
        className="m-vocabulary-select-item"
        key={vIri}
        onClick={() => onChange(vIri)}
      >
        {vocabularies[vIri].label}
      </DropdownItem>
    );
  });

  return (
    <UncontrolledDropdown
      id={props.id}
      group={true}
      size="sm"
      className="w-100"
    >
      <DropdownToggle caret={true} className="w-100">
        {vocabulary ? vocabulary.label : i18n("vocabulary.select-vocabulary")}
      </DropdownToggle>
      <DropdownMenu
        modifiers={{
          setMaxHeight: {
            enabled: true,
            order: 890,
            fn: (data) => {
              return {
                ...data,
                styles: {
                  ...data.styles,
                  overflow: "auto",
                  maxHeight: Utils.calculateAssetListHeight() + "px",
                },
              };
            },
          },
        }}
      >
        {items}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

export default VocabularySelect;
