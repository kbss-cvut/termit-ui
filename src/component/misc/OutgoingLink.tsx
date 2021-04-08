import * as React from "react";
import "intelligent-tree-select/lib/styles.css";
import "./OutgoingLink.scss";
import { useI18n } from "../hook/useI18n";

interface OutgoingLinkProps {
  label: string | JSX.Element;
  iri: string;
  showLink?: boolean;
  className?: string;
  id?: string;
}

export const OutgoingLink: React.FC<OutgoingLinkProps> = (
  props: OutgoingLinkProps
) => {
  const { formatMessage } = useI18n();
  return (
    <span>
      {props.label}
      <a
        id={props.id}
        href={props.iri}
        target="_blank"
        style={{ color: "gray" }}
        className={props.className}
        rel="noopener noreferrer"
        title={formatMessage("link.external.title", { url: props.iri })}
      >
        <span className={props.showLink ? "" : "hidden"}>
          &nbsp;
          <small>
            <i className="fas fa-external-link-alt text-primary" />
          </small>
        </span>
      </a>
    </span>
  );
};

OutgoingLink.defaultProps = {
  showLink: true,
};

export default OutgoingLink;
