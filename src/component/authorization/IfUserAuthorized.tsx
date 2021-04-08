import * as React from "react";
import {useSelector} from "react-redux";
import TermItState from "../../model/TermItState";
import {IfNoneGranted} from "react-authorization";
import VocabularyUtils from "../../util/VocabularyUtils";
import Unauthorized from "./Unauthorized";

interface IfUserAuthorizedProps {
    renderUnauthorizedAlert?: boolean; // Whether an alert should be rendered if user is not authorized. Defaults to true
    unauthorized?: React.ReactNode;
}

/**
 * Renders children if current user (taken from Redux store) is not restricted.
 */
const IfUserAuthorized: React.FC<IfUserAuthorizedProps> = props => {
    const {renderUnauthorizedAlert, unauthorized, children} = props;
    const user = useSelector((state: TermItState) => state.user);
    return (
        <IfNoneGranted
            expected={VocabularyUtils.USER_RESTRICTED}
            actual={user.types}
            unauthorized={renderUnauthorizedAlert && (unauthorized ? unauthorized : <Unauthorized />)}>
            {children}
        </IfNoneGranted>
    );
};

IfUserAuthorized.defaultProps = {
    renderUnauthorizedAlert: true
};

export default IfUserAuthorized;
