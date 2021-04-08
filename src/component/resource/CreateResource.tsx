import * as React from "react";
import Routing from "../../util/Routing";
import Routes from "../../util/Routes";
import IdentifierResolver from "../../util/IdentifierResolver";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import CreateResourceForm from "./CreateResourceForm";
import IfUserAuthorized from "../authorization/IfUserAuthorized";
import {useI18n} from "../hook/useI18n";

export const CreateResource: React.FC = () => {
    const {i18n} = useI18n();
    const onSuccess = (iri: string, iriLocation: string) => {
        Routing.transitionTo(Routes.resourceSummary, IdentifierResolver.routingOptionsFromLocation(iri));
    };

    const onCancel = () => {
        Routing.transitionTo(Routes.resources);
    };

    return (
        <IfUserAuthorized>
            <WindowTitle title={i18n("resource.create.title")} />
            <HeaderWithActions title={i18n("resource.create.title")} />
            <CreateResourceForm onCancel={onCancel} onSuccess={onSuccess} justDocument={false} />
        </IfUserAuthorized>
    );
};

export default CreateResource;
