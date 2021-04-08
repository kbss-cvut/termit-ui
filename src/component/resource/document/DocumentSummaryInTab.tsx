import * as React from "react";
import { ResourceSummary, ResourceSummaryProps } from "../ResourceSummary";
import Document from "../../../model/Document";
import { connect } from "react-redux";
import TermItState from "../../../model/TermItState";
import { ThunkDispatch } from "../../../util/Types";
import VocabularyUtils, { IRI } from "../../../util/VocabularyUtils";
import {
  loadResource,
  removeResource,
  updateResource,
} from "../../../action/AsyncActions";
import Resource from "../../../model/Resource";
import { injectIntl } from "react-intl";
import withI18n from "../../hoc/withI18n";
import ResourceMetadata from "../ResourceMetadata";
import Utils from "../../../util/Utils";
import DocumentFiles from "./DocumentFiles";

interface DocumentSummaryInTabProps extends ResourceSummaryProps {
  resource: Document;
  onChange: () => void;
}

export class DocumentSummaryInTab extends ResourceSummary<DocumentSummaryInTabProps> {
  protected canRemove(): false | boolean {
    return (
      !this.props.resource.vocabulary &&
      Utils.sanitizeArray(this.props.resource.files).length === 0
    );
  }

  public reload = () => {
    this.props
      .loadResource(VocabularyUtils.create(this.props.resource.iri))
      .then(this.props.onChange);
  };

  public render() {
    return <div>{this.renderMetadata()}</div>;
  }

  protected renderMetadata() {
    return (
      <div className="metadata-panel">
        <ResourceMetadata resource={this.props.resource} inTab={true} />
        <DocumentFiles
          document={this.props.resource}
          onFileAdded={this.reload}
          onFileRemoved={this.reload}
        />
      </div>
    );
  }
}

export default connect(
  (state: TermItState) => ({ intl: state.intl }),
  (dispatch: ThunkDispatch) => {
    return {
      loadResource: (iri: IRI) => dispatch(loadResource(iri)),
      saveResource: (resource: Resource) => dispatch(updateResource(resource)),
      removeResource: (resource: Resource) =>
        dispatch(removeResource(resource)),
    };
  }
)(injectIntl(withI18n(DocumentSummaryInTab)));
