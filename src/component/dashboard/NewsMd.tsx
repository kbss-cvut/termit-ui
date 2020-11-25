import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import ReactMarkdown from "react-markdown";
import ContainerMask from "../misc/ContainerMask";
import {getShortLocale} from "../../util/IntlUtil";
import {connect} from "react-redux";
import {ThunkDispatch} from "../../util/Types";
import {loadNews as loadNewsAction} from "../../action/AsyncActions";

interface NewsMdProps extends HasI18n {
    loadNews: (lang: string) => Promise<string | null>;
}

const NewsMd: React.FC<NewsMdProps> = props => {
    const {locale, loadNews} = props;
    const [newsMd, setNewsMd] = React.useState<string | null>(null);
    React.useEffect(() => {
        loadNews(getShortLocale(locale)).then(data => setNewsMd(data));
    }, [locale, loadNews]);

    return newsMd ? <ReactMarkdown source={newsMd}/> : <ContainerMask/>;
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {loadNews: (lang: string) => dispatch(loadNewsAction(lang))};
})(injectIntl(withI18n(NewsMd)));
