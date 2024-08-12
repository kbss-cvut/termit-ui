import Document from "./Document";
import { useI18n } from "../component/hook/useI18n";
import { Routing, Vocabularies } from "../util/Routing";
import AssetLink from "../component/misc/AssetLink";
import { Label } from "reactstrap";

interface DocumentLinkProps {
  document: Document;
  id?: string;
  className?: string;
}

const DocumentLink: React.FC<DocumentLinkProps> = (props) => {
  const { i18n } = useI18n();
  const { document, id, className } = props;
  if (!document.vocabulary || !document.vocabulary.iri) {
    return <Label>{document.label}</Label>;
  }

  const { route, params, query } =
    Vocabularies.getDocumentRoutingOptions(document);

  const path = Routing.getTransitionPath(route, { params, query });

  const asset = {
    label: document.label,
    iri: document.vocabulary.iri,
  };

  return (
    <AssetLink
      id={id}
      asset={asset}
      path={path}
      tooltip={i18n("asset.link.tooltip")}
      className={className}
    />
  );
};

export default DocumentLink;
