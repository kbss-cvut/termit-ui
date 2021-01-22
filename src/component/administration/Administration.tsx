import * as React from "react";
import Users from "./Users";
import Maintenance from "./Maintenance";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {injectIntl} from "react-intl";
import WindowTitle from "../misc/WindowTitle";

const Administration: React.FC<HasI18n> = (props) => {
    return <>
        <WindowTitle title={props.i18n("main.nav.admin")}/>
        <Users/>
        <Maintenance/>
    </>;
};

export default injectIntl(withI18n(Administration));
