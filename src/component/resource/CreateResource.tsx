import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import IdentifierResolver from "../../util/IdentifierResolver";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import CreateResourceForm from "./CreateResourceForm";
import withLoading from "../hoc/withLoading";
import IfUserAuthorized from "../authorization/IfUserAuthorized";

export const CreateResource: React.FC<HasI18n> = props => {

    const onSuccess = (iri: string, iriLocation: string) => {
        Routing.transitionTo(Routes.resourceSummary, IdentifierResolver.routingOptionsFromLocation(iri));
    };

    const onCancel = () => {
        Routing.transitionTo(Routes.resources);
    }

    const i18n = props.i18n;
    return <IfUserAuthorized>
        <WindowTitle title={i18n("resource.create.title")}/>
        <HeaderWithActions title={i18n("resource.create.title")}/>
        <CreateResourceForm onCancel={onCancel}
                            onSuccess={onSuccess}
                            justDocument={false}/>
    </IfUserAuthorized>;
}

export default injectIntl(withI18n(withLoading(CreateResource)));
