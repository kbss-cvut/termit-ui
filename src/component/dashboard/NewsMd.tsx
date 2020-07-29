import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../hoc/withI18n";
import ReactMarkdown from "react-markdown";
import Constants from "../../util/Constants";
import Ajax from "../../util/Ajax";
import ContainerMask from "../misc/ContainerMask";

interface NewsMdProps extends HasI18n {
}

interface NewsMdState {
    newsMd: string | null;
}

class NewsMd extends React.Component<NewsMdProps, NewsMdState> {
    constructor(props: NewsMdProps) {
        super(props);
        this.state = {
            newsMd: null
        };
    }

    public componentDidMount() {
        return this.loadNews(this.props.locale);
    }

    public componentDidUpdate(prevProps: Readonly<NewsMdProps>): void {
        if (this.props.locale !== prevProps.locale) {
            this.setState({newsMd: null});
            this.loadNews(this.props.locale);
        }
    }

    private loadNews(locale: string) {
        Ajax.get(Constants.NEWS_MD_URL[locale])
            .then((data: string) => {
                this.setState({newsMd: data});
            })
            .catch((reason: any) => {
                this.setState({newsMd: "*" + this.props.i18n("ajax.failed") + " (" + reason.status + ")*"});
            });
    }

    public render() {
        return this.state.newsMd ? <ReactMarkdown source={this.state.newsMd}/> : <ContainerMask/>;

    }
}

export default injectIntl(withI18n(NewsMd));
