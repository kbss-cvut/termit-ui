import * as React from "react";
import { injectIntl } from "react-intl";
// @ts-ignore
import { IntelligentTreeSelect } from "intelligent-tree-select";
import withI18n, { HasI18n } from "../hoc/withI18n";
import Vocabulary from "../../model/Vocabulary";
import { AssetData } from "../../model/Asset";
import { Col, FormGroup, Label, Row } from "reactstrap";
import { connect } from "react-redux";
import TermItState from "../../model/TermItState";
import Utils from "../../util/Utils";
import { createVocabularyValueRenderer } from "../misc/treeselect/Renderers";
import { ThunkDispatch } from "../../util/Types";
import { loadVocabularies } from "../../action/AsyncActions";

interface ImportedVocabulariesListEditProps extends HasI18n {
  vocabulary: Vocabulary;
  vocabularies: { [key: string]: Vocabulary };
  importedVocabularies?: AssetData[];
  onChange: (change: object) => void;
  loadVocabularies: () => void;
}

export class ImportedVocabulariesListEdit extends React.Component<ImportedVocabulariesListEditProps> {
  public componentDidMount() {
    if (Object.getOwnPropertyNames(this.props.vocabularies).length === 0) {
      this.props.loadVocabularies();
    }
  }

  public onChange = (selected: Vocabulary[]) => {
    const selectedVocabs = selected.map((v) => ({ iri: v.iri }));
    this.props.onChange({ importedVocabularies: selectedVocabs });
  };

  public render() {
    const i18n = this.props.i18n;
    const options = Object.keys(this.props.vocabularies)
      .map((v) => this.props.vocabularies[v])
      .filter((v) => v.iri !== this.props.vocabulary.iri);
    const selected = Utils.sanitizeArray(this.props.importedVocabularies).map(
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
              onChange={this.onChange}
              value={selected}
              options={options}
              valueKey="iri"
              labelKey="label"
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
  }
}

export default connect(
  (state: TermItState) => ({ vocabularies: state.vocabularies }),
  (dispatch: ThunkDispatch) => {
    return {
      loadVocabularies: () => dispatch(loadVocabularies()),
    };
  }
)(injectIntl(withI18n(ImportedVocabulariesListEdit)));
