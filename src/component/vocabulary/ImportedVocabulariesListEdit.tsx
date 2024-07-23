import * as React from "react";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import Vocabulary from "../../model/Vocabulary";
import { AssetData } from "../../model/Asset";
import { Col, FormGroup, Label, Row } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import Utils from "../../util/Utils";
import { createVocabularyValueRenderer } from "../misc/treeselect/Renderers";
import { ThunkDispatch } from "../../util/Types";
import { loadVocabularies } from "../../action/AsyncActions";
import { useI18n } from "../hook/useI18n";
import Term, { TermData } from "../../model/Term";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";

interface ImportedVocabulariesListEditProps {
  vocabulary: Vocabulary;
  importedVocabularies?: AssetData[];
  onChange: (change: object) => void;
}

const ImportedVocabulariesListEdit: React.FC<ImportedVocabulariesListEditProps> =
  ({ vocabulary, importedVocabularies, onChange }) => {
    const { i18n, locale } = useI18n();
    const vocabularies = useSelector(
      (state: TermItState) => state.vocabularies
    );
    const dispatch: ThunkDispatch = useDispatch();
    React.useEffect(() => {
      if (Object.getOwnPropertyNames(vocabularies).length === 0) {
        dispatch(loadVocabularies());
      }
    }, [dispatch, vocabularies]);

    const onSelect = (selected: Vocabulary[]) => {
      const selectedVocabs = selected.map((v) => ({ iri: v.iri }));
      onChange({ importedVocabularies: selectedVocabs });
    };

    const options = Object.keys(vocabularies)
      .map((v) => vocabularies[v])
      .filter((v) => v.iri !== vocabulary.iri);
    const selected = Utils.sanitizeArray(importedVocabularies).map(
      (v) => v.iri!
    );
    return (
      <Row>
        <Col xs={12}>
          <FormGroup>
            <Label className="attribute-label">
              {i18n("vocabulary.detail.imports.edit")}
            </Label>
            <IntelligentTreeSelect
              className="p-0"
              onChange={onSelect}
              value={selected}
              options={options}
              valueKey="iri"
              getOptionLabel={(option: Term | TermData) =>
                getLocalized(option.label, getShortLocale(locale))
              }
              childrenKey="children"
              placeholder={i18n("select.placeholder")}
              classNamePrefix="react-select"
              isMenuOpen={false}
              multi={true}
              showSettings={false}
              displayInfoOnHover={false}
              renderAsTree={false}
              simpleTreeData={true}
              valueRenderer={createVocabularyValueRenderer()}
            />
          </FormGroup>
        </Col>
      </Row>
    );
  };

export default ImportedVocabulariesListEdit;
