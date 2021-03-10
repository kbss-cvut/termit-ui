import * as React from "react";
import {UncontrolledTooltip} from "reactstrap";
import "./CopyIriIcon.scss"
import {useI18n} from "../hook/useI18n";

interface CopyIriIconProps {
    url: string;
}

const CopyIriIcon: React.FC<CopyIriIconProps> = ({url}) => {
    const {i18n} = useI18n();
    const copyToClipboard = () => {
        if (!navigator.clipboard) {
            return;
        }
        navigator.clipboard.writeText(url).then(() => {
            const tooltip = document.getElementById("tooltip-link-icon");
            if (tooltip) {
                tooltip.textContent = i18n("tooltip.copied");
            }
        });
    }

    return <>
        <i id="link-icon" className="fas fa-link text-primary link-icon" onClick={copyToClipboard}><sub
            className="sub">IRI</sub></i>
        <UncontrolledTooltip id="tooltip-link-icon" placement="right" offset="1rem" target="link-icon"
                             fade={true} delay={{show: 0, hide: 500}}>
            {i18n("tooltip.copy-iri")}
        </UncontrolledTooltip></>
}

export default CopyIriIcon;
