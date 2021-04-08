import * as React from "react";
import "./FooterMenu.scss";
import LanguageSelector from "../main/LanguageSelector";
import classNames from "classnames";
import {useSelector} from "react-redux";
import TermItState from "../../model/TermItState";

interface FooterMenuProps {
    fixed: boolean;
}

export const FooterMenu: React.FC<FooterMenuProps> = props => {
    const {fixed} = props;
    const sidebarExpanded = useSelector((state: TermItState) => state.sidebarExpanded);
    const desktopView = useSelector((state: TermItState) => state.desktopView);
    return (
        <div
            className={classNames("d-flex", "justify-content-between", "align-items-center", {
                "footer-sidebar": fixed && sidebarExpanded && desktopView,
                "text-white-link": fixed && sidebarExpanded && desktopView
            })}
        >
            <LanguageSelector fixed={fixed && sidebarExpanded} authenticated={true} />
        </div>
    );
};

export default FooterMenu;
