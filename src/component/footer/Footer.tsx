import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import "./Footer.scss";
import Constants from "../../util/Constants";
import {Col, Row, UncontrolledTooltip} from "reactstrap";
import FooterModalViewer from "./FooterModalViewer";
import {GoZap} from "react-icons/go";
import FooterMenu from "./FooterMenu";
import classNames from "classnames";
import ErrorLogViewer from "../audit/ErrorLogViewer";
import NewsMd from "../dashboard/NewsMd";
import grantLogoCz from "../static/opz_logo_cz.jpg";
import grantLogoEn from "../static/opz_logo_en.jpg";

interface FooterProps extends HasI18n {
    transparent?: boolean;
    authenticated: boolean;
    sidebarExpanded: boolean;
}

interface FooterState {
    showLog: boolean;
    showNews: boolean;
}

class Footer extends React.Component<FooterProps, FooterState> {
    public static defaultProps = {
        transparent: false
    };

    public constructor(props: FooterProps) {
        super(props);
        this.state = {
            showLog: false,
            showNews: false
        };
    }

    private toggleLogViewer = () => this.setState({showLog: !this.state.showLog});

    private toggleNewsViewer = () => this.setState(prevState => ({showNews: !prevState.showNews}));

    public render() {
        const {i18n, transparent, authenticated, sidebarExpanded} = this.props;

        return (
            <footer className={classNames("footer-row", {"transparent": transparent})}>
                <div className={classNames("footer-left", {
                    "footer-left-expanded": sidebarExpanded,
                    "footer-left-collapsed": !sidebarExpanded
                })}>
                    <FooterMenu fixed={authenticated}/>
                </div>
                <Col className="px-2 px-sm-3">
                    <Row className="align-items-center">
                        <Col xs="auto">
                            &copy;&nbsp;
                            <a href="https://kbss.felk.cvut.cz" target="_blank"
                               rel="noreferrer"
                               title={i18n("footer.copyright.kbss")}>{i18n("footer.copyright.kbss")}</a>
                            ,&nbsp;
                            <a href="https://mvcr.cz" target="_blank"
                               rel="noreferrer"
                               title={i18n("footer.copyright.mvcr.tooltip")}>{i18n("footer.copyright.mvcr")}</a>
                            ,&nbsp;{new Date().getFullYear()}
                        </Col>
                    </Row>
                </Col>
                <div className="pl-xs-1 px-2 px-sm-3">
                    <a href="https://esf2014.esfcr.cz/PublicPortal/Views/Projekty/Public/ProjektDetailPublicPage.aspx?action=get&datovySkladId=F5E162B2-15EC-4BBE-9ABD-066388F3D412"
                       target="_blank" rel="noreferrer">
                        <img id="footer-grant-logo"
                             src={this.props.locale === Constants.LANG.CS.locale ? grantLogoCz : grantLogoEn}
                             className="grant-logo" alt={i18n("footer.grant.text")}/>
                    </a>
                    <UncontrolledTooltip target="footer-grant-logo">
                        <p>{i18n("footer.grant.text")}</p>
                    </UncontrolledTooltip>
                </div>
                <div>
                <span onClick={this.toggleLogViewer} className="log-viewer-toggle pl-xs-1 px-2 px-sm-3"
                      title={i18n("log-viewer.title")} id="log-viewer-toggler"><GoZap/></span>
                    <FooterModalViewer
                        title="log-viewer.title"
                        show={this.state.showLog}
                        onClose={this.toggleLogViewer}>
                        <ErrorLogViewer/>
                    </FooterModalViewer>
                </div>
                <div className="news-viewer-toggle px-1 px-sm-2 px-sm-3 text-right">
                    <span onClick={this.toggleNewsViewer} id="news-toggler">
                        <span className="footer-version">{i18n("footer.version")}&nbsp;</span>
                        {Constants.VERSION}
                    </span>
                    <FooterModalViewer
                        title="news-viewer.title"
                        show={this.state.showNews}
                        onClose={this.toggleNewsViewer}>
                        <NewsMd/>
                    </FooterModalViewer>
                </div>
            </footer>);
    }
}

export default injectIntl(withI18n(Footer));
