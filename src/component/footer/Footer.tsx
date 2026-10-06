import * as React from "react";
import { useI18n } from "../hook/useI18n";
import "./Footer.scss";
import Constants from "../../util/Constants";
import { Col } from "reactstrap";
import FooterModalViewer from "./FooterModalViewer";
import { GoZap } from "react-icons/go";
import FooterMenu from "./FooterMenu";
import classNames from "classnames";
import ErrorLogViewer from "../audit/ErrorLogViewer";
import NewsMd from "../dashboard/NewsMd";

interface FooterProps {
  transparent?: boolean;
  authenticated: boolean;
  sidebarExpanded: boolean;
}

const Footer: React.FC<FooterProps> = ({
  transparent = false,
  authenticated,
  sidebarExpanded,
}) => {
  const { i18n } = useI18n();
  const [showLog, setShowLog] = React.useState(false);
  const [showNews, setShowNews] = React.useState(false);

  const toggleLogViewer = () => setShowLog(!showLog);
  const toggleNewsViewer = () => setShowNews((prevState) => !prevState);

  return (
    <footer className={classNames("footer-row", { transparent: transparent })}>
      <div
        className={classNames("footer-left", {
          "footer-left-expanded": sidebarExpanded,
          "footer-left-collapsed": !sidebarExpanded,
        })}
      >
        <FooterMenu fixed={authenticated} />
      </div>
      <Col className="px-sm-3 px-2">
        <a
          href="https://kbss.felk.cvut.cz"
          target="_blank"
          rel="noopener noreferrer"
          title={i18n("footer.copyright")}
        >
          &copy;&nbsp;{i18n("footer.copyright")}, {new Date().getFullYear()}
        </a>
      </Col>
      <div>
        <button
          type="button"
          onClick={toggleLogViewer}
          className="log-viewer-toggle pl-xs-1 px-sm-3 px-2"
          title={i18n("log-viewer.title")}
          id="log-viewer-toggler"
        >
          <GoZap />
        </button>
        <FooterModalViewer
          title="log-viewer.title"
          show={showLog}
          onClose={toggleLogViewer}
        >
          <ErrorLogViewer />
        </FooterModalViewer>
      </div>
      <div>
        <a
          href={`${Constants.SERVER_URL}/swagger-ui/index.html`}
          title={i18n("footer.apidocs.tooltip")}
          target="_blank"
          rel="noopener noreferrer"
        >
          {i18n("footer.apidocs")}
        </a>
      </div>
      <div className="news-viewer-toggle px-sm-2 px-sm-3 px-1 text-right">
        <button
          type="button"
          onClick={toggleNewsViewer}
          id="news-toggler"
          title={i18n("footer.version.tooltip")}
        >
          <span className="footer-version">{i18n("footer.version")}&nbsp;</span>
          {Constants.VERSION}
        </button>
        <FooterModalViewer
          title="news-viewer.title"
          show={showNews}
          onClose={toggleNewsViewer}
        >
          <NewsMd />
        </FooterModalViewer>
      </div>
    </footer>
  );
};

export default Footer;
