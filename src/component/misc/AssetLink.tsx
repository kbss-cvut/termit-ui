import * as React from "react";
import { Link } from "react-router-dom";
import OutgoingLink from "./OutgoingLink";
import classNames from "classnames";

interface AssetType {
  iri: string;
  label: React.ReactNode | string;
}

interface AssetLinkProps<T extends AssetType> {
  asset: T;
  path: string;
  tooltip?: string;
  id?: string;
  className?: string;
}

const AssetLink: React.FC<AssetLinkProps<AssetType>> = ({
  asset,
  path,
  tooltip,
  id,
  className,
}) => {
  const [showLink, setShowLink] = React.useState(false);
  return (
    <span
      className="m-asset-link-wrapper"
      onMouseOut={() => setShowLink(false)}
      onMouseOver={() => setShowLink(true)}
    >
      <OutgoingLink
        label={
          <Link
            id={id}
            title={tooltip ? tooltip : undefined}
            to={path}
            className={className}
          >
            {asset.label}
          </Link>
        }
        iri={asset.iri}
        showLink={showLink}
        className={classNames("m-asset-link", className)}
      />
    </span>
  );
};

export default AssetLink;
