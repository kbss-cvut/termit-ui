import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import "./FooterMenu.scss";
import LanguageSelector from "../main/LanguageSelector";
import classNames from "classnames";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";

interface FooterMenuProps extends HasI18n {
    fixed: boolean;
    sidebarExpanded: boolean;
    desktopView: boolean;
}

export class FooterMenu extends React.Component<FooterMenuProps> {
    public render() {
        const {fixed, sidebarExpanded, desktopView} = this.props;

        return (
            <div className={
                classNames(
                    "d-flex",
                    "justify-content-between",
                    "align-items-center",
                    {
                        "footer-sidebar": fixed && sidebarExpanded && desktopView,
                        "text-white-link": fixed && sidebarExpanded && desktopView,
                    })}>
                <LanguageSelector fixed={fixed && sidebarExpanded} authenticated={true}/>
            </div>);
    }
}

export default connect(
    (
        state: TermItState) => {
        return {
            sidebarExpanded: state.sidebarExpanded,
            desktopView: state.desktopView
        };
    }
)(injectIntl(withI18n(FooterMenu)));

