import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {Alert} from "reactstrap";
import {FaExclamationTriangle} from "react-icons/all";
import {injectIntl} from "react-intl";

const Unauthorized: React.FC<HasI18n> = props => {
    const i18n = props.i18n;

    return <div className="m-3" id="unauthorized-container">
        <Alert color="warning">
            <h3>
                <FaExclamationTriangle className="mr-2 mb-1"/>
                {i18n("unauthorized.message")}
            </h3>
        </Alert>
    </div>
};

export default injectIntl(withI18n(Unauthorized));