import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import "./Footer.scss";
import Constants from "../../util/Constants";
import {Col} from "reactstrap";
import FooterModalViewer from "./FooterModalViewer";
import {GoZap} from "react-icons/go";
import FooterMenu from "./FooterMenu";
import classNames from "classnames";
import ErrorLogViewer from "../audit/ErrorLogViewer";
import NewsMd from "../dashboard/NewsMd";

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
            <footer className={classNames("footer-row", {transparent: transparent})}>
                <div
                    className={classNames("footer-left", {
                        "footer-left-expanded": sidebarExpanded,
                        "footer-left-collapsed": !sidebarExpanded
                    })}>
                    <FooterMenu fixed={authenticated} />
                </div>
                <Col className="px-2 px-sm-3">
                    <a
                        href="https://kbss.felk.cvut.cz"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={i18n("footer.copyright")}>
                        &copy;&nbsp;{i18n("footer.copyright")}, {new Date().getFullYear()}
                    </a>
                </Col>
                <div>
                    <span
                        onClick={this.toggleLogViewer}
                        className="log-viewer-toggle pl-xs-1 px-2 px-sm-3"
                        title={i18n("log-viewer.title")}
                        id="log-viewer-toggler">
                        <GoZap />
                    </span>
                    <FooterModalViewer
                        title="log-viewer.title"
                        show={this.state.showLog}
                        onClose={this.toggleLogViewer}>
                        <ErrorLogViewer />
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
                        <NewsMd />
                    </FooterModalViewer>
                </div>
            </footer>
        );
    }
}

export default injectIntl(withI18n(Footer));
