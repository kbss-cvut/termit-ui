import * as React from "react";
import {Badge, Nav, NavItem, NavLink, TabContent, TabPane} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import classNames from "classnames";

interface TabsProps extends HasI18n {
    /**
     * ID of the active tab. The ID should be also a localization key of its title.
     */
    activeTabLabelKey: string,
    /**
     * Map of IDs to the actual components
     */
    tabs: { [activeTabLabelKey: string]: JSX.Element },
    /**
     * Map of IDs to the tab badge (no badge shown if the key is missing)
     */
    tabBadges?: { [activeTabLabelKey: string]: string | null},
    /**
     * Tab change function.
     */
    changeTab: (selectedTabLabelKey: string) => void,
    /**
     * Navigation link style.
     */
    navLinkStyle?: string
}

export class Tabs extends React.Component<TabsProps> {

    public render() {
        const navLinks: any[] = [];
        const tabs: any[] = [];
        const activeKey = this.props.activeTabLabelKey;
        const propsChangeTab = this.props.changeTab;

        Object.keys(this.props.tabs).forEach((id) => {
            const changeTab = () => {
                if (id !== activeKey) {
                    propsChangeTab(id);
                }
            };

            const badge = this.props.tabBadges && id in this.props.tabBadges && this.props.tabBadges[id]
                ? <>{" "}<Badge>{this.props.tabBadges[id]}</Badge></>
                : null;

            const className = classNames(this.props.navLinkStyle ? this.props.navLinkStyle : "", (id === this.props.activeTabLabelKey) ? "active" : "");

            navLinks.push(
                <NavItem key={id}>
                    <NavLink
                        className={className}
                        onClick={changeTab}>
                        {this.props.formatMessage(id, {})}
                        {badge}
                    </NavLink>
                </NavItem>
            );
            const tabComponent = this.props.tabs[id];
            tabs.push(
                <TabPane tabId={id} key={id}>
                    {tabComponent}
                </TabPane>
            );
        });

        return <div><Nav tabs={true}>
            {navLinks}
        </Nav>
            <TabContent activeTab={this.props.activeTabLabelKey}>
                {tabs}
            </TabContent>
        </div>
    }
}

export default injectIntl(withI18n(Tabs));
