import React, {useState, useEffect} from "react";
import {UncontrolledAlert} from "reactstrap";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {injectIntl} from "react-intl";
import Constants from "../../../util/Constants";

const PREVIOUS_NEWS_VERSION_ALERT = "previous_news_version_alert";

const NewsAlert: React.FC<HasI18n> = (props) => {
    const version: string = Constants.VERSION;
    const [showAlert, displayAlert] = useState(false);

    useEffect(() => {
        if (window.localStorage.getItem(PREVIOUS_NEWS_VERSION_ALERT) !== version) {
            displayAlert(true);
            window.localStorage.setItem(PREVIOUS_NEWS_VERSION_ALERT, version);
        }
    }, [displayAlert, version]);

    return showAlert ?
        <UncontrolledAlert color="secondary">
            {props.formatMessage("dashboard.widget.alert.news", {version})}
        </UncontrolledAlert> : null;
};

export default injectIntl(withI18n(NewsAlert));
