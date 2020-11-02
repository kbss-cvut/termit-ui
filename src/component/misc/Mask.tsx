import * as React from "react";
import classNames from "classnames";
import {ClipLoader} from "react-spinners";
import {injectIntl} from "react-intl";
import "./Mask.scss";
import withI18n, {HasI18n} from "../hoc/withI18n";

export interface MaskProps extends HasI18n {
    text?: string,
    withoutText?: boolean,
    classes?: string
}

const Mask: React.FC<MaskProps> = (props) => {
    const containerClasses = classNames("spinner-container", {"without-text": props.withoutText});
    const text = props.text ? props.text : props.i18n("please-wait");
    return <div className={props.classes ? props.classes : "mask"}>
        <div className={containerClasses}>
            <div style={{width: 32, height: 32, margin: "auto"}}>
                <ClipLoader color="#057fa5" size={32}/>
            </div>
            {!props.withoutText && <div className="spinner-message">{text}</div>}
        </div>
    </div>;
};

Mask.defaultProps = {
    classes: "mask",
    withoutText: false
};

export default injectIntl(withI18n(Mask));
