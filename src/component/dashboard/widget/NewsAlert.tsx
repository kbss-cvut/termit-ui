import { useEffect, useState } from "react";
import * as React from "react";
import { UncontrolledAlert } from "reactstrap";
import Constants from "../../../util/Constants";
import { useI18n } from "../../hook/useI18n";
import BrowserStorage from "../../../util/BrowserStorage";

const PREVIOUS_NEWS_VERSION_ALERT = "previous_news_version_alert";

const NewsAlert: React.FC = () => {
  const version: string = Constants.VERSION;
  const { formatMessage } = useI18n();
  const [showAlert, displayAlert] = useState(false);

  useEffect(() => {
    if (BrowserStorage.get(PREVIOUS_NEWS_VERSION_ALERT) !== version) {
      displayAlert(true);
      BrowserStorage.set(PREVIOUS_NEWS_VERSION_ALERT, version);
    }
  }, [displayAlert, version]);

  return showAlert ? (
    <UncontrolledAlert color="secondary">
      {formatMessage("dashboard.widget.alert.news", { version })}
    </UncontrolledAlert>
  ) : null;
};

export default NewsAlert;
