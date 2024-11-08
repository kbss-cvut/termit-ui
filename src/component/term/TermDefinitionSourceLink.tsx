import * as React from "react";
import Term from "../../model/Term";
import Routes from "../../util/Routes";
import { Button } from "reactstrap";
import { GoFileSymlinkFile } from "react-icons/go";
import VocabularyUtils from "../../util/VocabularyUtils";
import Utils from "../../util/Utils";
import Routing from "../../util/Routing";
import { useDispatch } from "react-redux";
import { pushRoutingPayload } from "../../action/SyncActions";
import { useI18n } from "../hook/useI18n";
import File from "../../model/File";
import { loadFileMetadata } from "../../action/AsyncResourceActions";
import { ThunkDispatch } from "../../util/Types";

interface TermDefinitionSourceLinkProps {
  term: Term;
}

export const TermDefinitionSourceLink: React.FC<
  TermDefinitionSourceLinkProps
> = (props) => {
  const defSource = props.term.definitionSource;
  const { i18n } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const [file, setFile] = React.useState<File>();
  const target = defSource!.target;
  const targetIri = VocabularyUtils.create(target.source.iri!);
  React.useEffect(() => {
    if (defSource) {
      dispatch(
        loadFileMetadata(VocabularyUtils.create(defSource.target!.source!.iri!))
      ).then((file?: File) => setFile(file));
    }
  }, [defSource, dispatch]);
  const navigateToDefinitionSource = () => {
    if (!file || !file.owner) {
      return;
    }
    // assert target.selectors.length === 1
    dispatch(
      pushRoutingPayload(Routes.annotateFile, {
        selector: Utils.sanitizeArray(target.selectors)[0],
      })
    );
    const ownerIri = VocabularyUtils.create(file.owner.iri!);
    Routing.transitionTo(Routes.annotateFile, {
      params: new Map([
        ["name", ownerIri.fragment],
        ["fileName", targetIri.fragment],
      ]),
      query: new Map([
        ["namespace", ownerIri.namespace!],
        ["fileNamespace", targetIri.namespace!],
      ]),
    });
  };

  return (
    <>
      <Button
        id="term-metadata-definitionSource-goto"
        color="primary"
        outline={true}
        disabled={!file}
        size="sm"
        className="ml-2"
        onClick={navigateToDefinitionSource}
        title={i18n("term.metadata.definitionSource.goto.tooltip")}
      >
        <GoFileSymlinkFile className="mr-1" />
        {i18n("term.metadata.definitionSource.goto")}
      </Button>
    </>
  );
};

export default TermDefinitionSourceLink;
