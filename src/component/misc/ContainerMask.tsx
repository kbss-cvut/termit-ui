import * as React from "react";
import classNames from "classnames";
import {ClipLoader} from "react-spinners";
import "./Mask.scss";
import {MaskProps} from "./Mask";
import {useI18n} from "../hook/useI18n";

const ContainerMask: React.FC<MaskProps> = props => {
    const {i18n} = useI18n();
    const containerClasses = classNames("spinner-container", {"without-text": props.withoutText});
    const text = props.text ? props.text : i18n("please-wait");
    return (
        <div className={props.classes ? props.classes : "mask-container"}>
            <div className={containerClasses}>
                <div style={{width: 32, height: 32, margin: "auto"}}>
                    <ClipLoader color="#29AB87" size={32} />
                </div>
                {!props.withoutText && <div className="spinner-message">{text}</div>}
            </div>
        </div>
    );
};

ContainerMask.defaultProps = {
    classes: "mask-container",
    withoutText: false
};

export default ContainerMask;
