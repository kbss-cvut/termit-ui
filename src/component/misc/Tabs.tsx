import * as React from "react";
import { Badge, Nav, NavItem, NavLink, TabContent, TabPane } from "reactstrap";
import classNames from "classnames";
import { useI18n } from "../hook/useI18n";

interface TabsProps {
  /**
   * ID of the active tab. The ID should be also a localization key of its title.
   */
  activeTabLabelKey: string;
  /**
   * Map of IDs to the actual components
   */
  tabs: { [activeTabLabelKey: string]: React.JSX.Element };
  /**
   * Map of IDs to the tab badge (no badge shown if the key is missing)
   */
  tabBadges?: { [activeTabLabelKey: string]: string | null };
  /**
   * Tab change function.
   */
  changeTab: (selectedTabLabelKey: string) => void;
  /**
   * Navigation link style.
   */
  navLinkStyle?: string;
  /**
   * Classname for the Nav component
   */
  navClassName?: string;
  /**
   * Classname for the TabContent component
   */
  contentClassName?: string;
}

const Tabs: React.FC<TabsProps> = (props) => {
  const { formatMessage } = useI18n();

  const navLinks: any[] = [];
  const tabs: any[] = [];
  const activeKey = props.activeTabLabelKey;
  const propsChangeTab = props.changeTab;

  Object.keys(props.tabs).forEach((id) => {
    const changeTab = () => {
      if (id !== activeKey) {
        propsChangeTab(id);
      }
    };

    const badge =
      props.tabBadges && id in props.tabBadges && props.tabBadges[id] ? (
        <>
          {" "}
          <Badge className="align-text-bottom">{props.tabBadges[id]}</Badge>
        </>
      ) : null;

    const className = classNames(
      props.navLinkStyle ? props.navLinkStyle : "",
      id === props.activeTabLabelKey ? "active" : ""
    );

    navLinks.push(
      <NavItem key={id}>
        <NavLink className={className} onClick={changeTab}>
          {formatMessage(id, {})}
          {badge}
        </NavLink>
      </NavItem>
    );
    const tabComponent = props.tabs[id];
    tabs.push(
      <TabPane tabId={id} key={id}>
        {tabComponent}
      </TabPane>
    );
  });

  return (
    <div>
      <Nav tabs={true} className={props.navClassName}>
        {navLinks}
      </Nav>
      <TabContent
        activeTab={props.activeTabLabelKey}
        className={props.contentClassName}
      >
        {tabs}
      </TabContent>
    </div>
  );
};

export default Tabs;
