import * as React from "react";
import {injectIntl} from "react-intl";
import withI18n, {HasI18n} from "../../hoc/withI18n";
import {FileData} from "../../../model/File";
import VocabularyUtils from "../../../util/VocabularyUtils";
import {Link} from "react-router-dom";
import Routes from "../../../util/Routes";
import {GoFile} from "react-icons/go";
import {ThunkDispatch} from "../../../util/Types";
import {connect} from "react-redux";
import {getContentType} from "../../../action/AsyncActions";
// @ts-ignore
import mimetype from "whatwg-mimetype";

interface FileContentLinkProps extends HasI18n {
    id?: string;
    file: FileData;
    // dispatchProps
    getContentType: (iri: string) => Promise<string>;
}

interface FileContentLinkState {
    contentType?: string | null;
}

export class FileContentLink extends React.Component<FileContentLinkProps, FileContentLinkState> {
    constructor(props: FileContentLinkProps) {
        super(props);
        this.state = {
            contentType: undefined
        };
    }

    private isContentSupported() {
        if (!this.state.contentType) {
            return false;
        }
        const mt = mimetype.parse(this.state.contentType);
        return mt.isHTML() || mt.isXML();
    }

    public componentDidMount() {
        this.props.getContentType(this.props.file.iri).then(contentType => {
            this.setState({contentType});
        });
    }

    public render() {
        const iri = VocabularyUtils.create(this.props.file.iri);
        const documentIri = VocabularyUtils.create(this.props.file.owner!.iri);
        const params = {name: documentIri.fragment, fileName: iri.fragment};
        const query = {namespace: documentIri.namespace, fileNamespace: iri.namespace};
        const contentSupported = this.isContentSupported();
        return contentSupported ? (
            <Link
                id={this.props.id}
                className="btn btn-primary btn-sm"
                title={this.props.i18n("resource.metadata.file.content.view.tooltip")}
                to={Routes.annotateFile.link(params, query)}
            >
                <GoFile />
                &nbsp;{this.props.i18n("resource.metadata.file.content")}
            </Link>
        ) : (
            <></>
        );
    }
}

export default connect(undefined, (dispatch: ThunkDispatch) => {
    return {
        getContentType: (iri: string) => dispatch(getContentType(VocabularyUtils.create(iri)))
    };
})(injectIntl(withI18n(FileContentLink)));
