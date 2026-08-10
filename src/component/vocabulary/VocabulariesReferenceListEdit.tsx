import * as React from "react";
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Vocabulary, { VocabularyData } from "../../model/Vocabulary";
import { AssetData } from "../../model/Asset";
import { Col, FormGroup, Label, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import Utils from "../../util/Utils";
import { createVocabularyValueRenderer } from "../misc/treeselect/Renderers";
import { ThunkDispatch } from "../../util/Types";
import { loadVocabularies } from "../../action/AsyncActions";
import { useI18n } from "../hook/useI18n";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import HelpIcon from "../misc/HelpIcon";

interface VocabulariesReferenceListEditProps {
  vocabulary: Vocabulary;
  selectedVocabularies?: AssetData[];
  fieldKey: string;
  labelKey: string;
  helpKey: string;
  onChange: (change: object) => void;
}

const VocabulariesReferenceListEdit: React.FC<
  VocabulariesReferenceListEditProps
> = ({
  vocabulary,
  selectedVocabularies,
  fieldKey,
  labelKey,
  helpKey,
  onChange,
}) => {
  const { i18n, locale } = useI18n();
  const vocabularies = useSelector((state: TermItState) => state.vocabularies);
  const dispatch: ThunkDispatch = useDispatch();

  React.useEffect(() => {
    if (Object.getOwnPropertyNames(vocabularies).length === 0) {
      dispatch(loadVocabularies());
    }
  }, [dispatch, vocabularies]);

  const onSelect = (selected: readonly Vocabulary[]) => {
    const selectedVocabs = selected.map((v) => ({ iri: v.iri }));
    onChange({ [fieldKey]: selectedVocabs });
  };

  const options = Object.keys(vocabularies)
    .map((v) => vocabularies[v])
    .filter((v) => v.iri !== vocabulary.iri);
  const selected = Utils.sanitizeArray(selectedVocabularies).map((v) => v.iri!);

  return (
    <Row>
      <Col xs={12}>
        <FormGroup>
          <Label className="attribute-label">
            {i18n(labelKey as any)}
            <HelpIcon id={`${fieldKey}-help`} text={i18n(helpKey as any)} />
          </Label>
          <IntelligentTreeSelect
            className="p-0"
            onChange={onSelect}
            value={selected}
            options={options}
            valueKey="iri"
            getOptionLabel={(option: VocabularyData) =>
              getLocalized(option.label, getShortLocale(locale))
            }
            childrenKey="children"
            placeholder={i18n("select.placeholder")}
            classNamePrefix="react-select"
            isMenuOpen={false}
            multi={true}
            renderAsTree={false}
            simpleTreeData={true}
            valueRenderer={createVocabularyValueRenderer()}
          />
        </FormGroup>
      </Col>
    </Row>
  );
};

export default VocabulariesReferenceListEdit;
