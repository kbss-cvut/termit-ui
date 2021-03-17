import * as React from "react";
import withI18n, {HasI18n} from "../../../hoc/withI18n";
import {Col, Label, Row, Table} from "reactstrap";
import TimeAgo from "javascript-time-ago";
import {injectIntl} from "react-intl";
import User from "../../../../model/User";
import {connect} from "react-redux";
import TermItState from "../../../../model/TermItState";
import TermIriLink from "../../../term/TermIriLink";
import RecentlyCommentedAsset from "../../../../model/RecentlyCommentedAsset";

interface CommentedAssetListProps extends HasI18n {
    locale: string;
    user: User;
    commentedAssets: RecentlyCommentedAsset[];
    loading: boolean;
}

export const CommentedAssetList: React.FC<CommentedAssetListProps> = props => {
    const { commentedAssets, loading, i18n, user, locale, formatMessage } = props;

    const renderEmptyInfo = () =>
       !loading ?
            <div className="italics py-2">{i18n("dashboard.widget.commentList.empty")}</div> : null;

    const renderMessage = (lastEdited : number, author : User) => {
        const formatter = new TimeAgo(props.locale);
        return (user.iri === author.iri) ?
            formatMessage("dashboard.widget.commentList.messageByYou", {
                when: formatter.format(lastEdited)
            }) :
            formatMessage("dashboard.widget.commentList.message", {
                user: author.fullName,
                when: formatter.format(lastEdited)
            })
    }

    const renderCommentedAsset = (commentedAsset : RecentlyCommentedAsset) => {
        const lastEdited = commentedAsset.lastComment.modified ? commentedAsset.lastComment.modified : commentedAsset.lastComment.created;
        return <td className="col-xs-12 px-0">
            <div>
                <TermIriLink iri={commentedAsset.iri!}/><br/>
                <div title={i18n("dashboard.widget.commentList.lastComment")}>{commentedAsset.lastComment.content}</div>
            </div>
            <Row>
                <Col xs={12}>
                    <Label className="italics asset-list-title-message"
                           title={new Date(lastEdited!).toLocaleString(locale)}>
                        {renderMessage(lastEdited!, new User(commentedAsset.lastComment.author!))}
                    </Label>
                </Col>
            </Row>
        </td>
    }

    const renderNonEmptyContent = () => {
        return <Table className="widget" borderless={true}>
            <tbody>
            {commentedAssets.map(commentedAsset => <tr key={commentedAsset.iri}>{renderCommentedAsset(commentedAsset)}</tr>)}
            </tbody>
        </Table>;
    }

    return <>
        {commentedAssets.length > 0 ?
            renderNonEmptyContent() :
            renderEmptyInfo()}
    </>;
}

export default connect((state: TermItState) => ({ user: state.user }))
(injectIntl(withI18n(CommentedAssetList)));

