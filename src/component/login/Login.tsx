import React from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {login as loginAction} from "../../action/AsyncUserActions";
import {useKeycloak} from "@react-keycloak/web";
import {Redirect} from "react-router-dom";
import Routes from "../../util/Routes";

interface LoginProps {
    login: () => void;
}

export const Login: React.FC<LoginProps> = props => {
    const login = props.login;
    const {keycloak} = useKeycloak();

    const loginCallback = React.useCallback(() => {
        login();
    }, [login]);

    if (keycloak.authenticated) {
        return <Redirect to={Routes.dashboard.path}/>
    } else {
        return <button type="button" onClick={loginCallback}>
            Login
        </button>
    }
};

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        login: () => dispatch(loginAction)
    };
})(Login);

