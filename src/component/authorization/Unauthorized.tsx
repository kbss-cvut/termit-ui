import * as React from "react";
import {Alert} from "reactstrap";
import {FaExclamationTriangle} from "react-icons/fa";
import {useI18n} from "../hook/useI18n";

const Unauthorized: React.FC = () => {
    const {i18n} = useI18n();

    return <div className="m-3" id="unauthorized-container">
        <Alert color="warning">
            <h3>
                <FaExclamationTriangle className="mr-2 mb-1"/>
                {i18n("unauthorized.message")}
            </h3>
        </Alert>
    </div>
};

export default Unauthorized;