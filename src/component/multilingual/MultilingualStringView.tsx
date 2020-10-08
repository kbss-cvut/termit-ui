import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import MultilingualString, {getLocalized} from "../../model/MultilingualString";
import {injectIntl} from "react-intl";
import {getShortLocale} from "../../util/IntlUtil";
import {FaBookOpen} from "react-icons/fa";
import {Badge, Popover, PopoverBody, Table} from "reactstrap";
import "./MultilingualStringView.scss";

interface MultilingualStringViewProps extends HasI18n {
    id: string;
    value: MultilingualString;
    language?: string;
}

export const MultilingualStringView: React.FC<MultilingualStringViewProps> = props => {
    const [show, setShow] = React.useState(false);
    const [pinned, setPinned] = React.useState(false);
    const {id, value, language, locale} = props;
    const toggleClick = () => {
        setPinned(!pinned);
    };
    const availableLanguages = Object.getOwnPropertyNames(value);
    return <>
        {getLocalized(value, language ? language : getShortLocale(locale))}
        {availableLanguages.length > 1 && <><FaBookOpen id={id}
                                                        className="m-translations-toggle ml-1 text-primary translations-icon"
                                                        onClick={toggleClick}
                                                        onMouseEnter={() => setShow(true)}
                                                        onMouseLeave={() => setShow(false)}/>
            <Popover target={id} isOpen={show || pinned} toggle={() => setShow(false)}
                     delay={{show: 0, hide: 0}} fade={false} innerClassName="translations-popover">
                <PopoverBody>
                    <Table size="sm" borderless={true} className="mb-0">
                        <tbody>
                        {availableLanguages.sort().map(lang => {
                            return <tr key={lang}>
                                <td><Badge color="info">{lang.toUpperCase()}</Badge></td>
                                <td>{value[lang]}</td>
                            </tr>;
                        })}
                        </tbody>
                    </Table>
                </PopoverBody>
            </Popover>
        </>
        }
    </>;
}

export default injectIntl(withI18n(MultilingualStringView));
