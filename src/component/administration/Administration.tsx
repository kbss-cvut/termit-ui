import * as React from "react";
import Users from "./Users";
import Maintenance from "./Maintenance";
import Constants from "../../util/Constants";
import {Helmet} from "react-helmet";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";

const Administration: React.FC<HasI18n> = (props) => {
    return <>
        <Helmet>
            <title>{`${props.i18n("main.nav.admin")} | ${Constants.APP_NAME}`}</title>
        </Helmet>
        <Users/>
        <Maintenance/>
    </>;
};

export default injectIntl(withI18n(Administration));
