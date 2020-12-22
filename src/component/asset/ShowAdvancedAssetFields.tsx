import * as React from "react";
import {Button, Collapse} from "reactstrap";
import withI18n, {HasI18n} from "../hoc/withI18n";
import {useState} from "react";
import {injectIntl} from "react-intl";

interface ShowAdvancedAssetFieldsProps extends HasI18n {
}

/**
 * "Show Advanced" component.
 *
 * It wraps components that are shown in advanced regime only.
 */
export const ShowAdvancedAssetFields: React.FC<ShowAdvancedAssetFieldsProps> = props => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const { children, i18n } = props;
    return <>
        <Button
            color="link"
            id="toggle-advanced"
            onClick={toggle}>
            {
                i18n(isOpen ? "asset.create.hideAdvancedSection" : "asset.create.showAdvancedSection")
            }
        </Button>
        <Collapse
            isOpen={isOpen}>
            {children}
        </Collapse>
    </>
}

export default injectIntl(withI18n(ShowAdvancedAssetFields));

