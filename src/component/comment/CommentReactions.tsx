import * as React from "react";
import {CommentReaction} from "../../model/Comment";
import {IconType} from "react-icons";
import User from "../../model/User";
import {connect} from "react-redux";
import TermItState from "../../model/TermItState";

interface CommentReactionsProps {
    reactions: CommentReaction[];
    iconOn: IconType;
    iconOff: IconType;
    iconOnTitle: string;
    iconOffTitle: string;

    currentUser: User;
}

const CommentReactions: React.FC<CommentReactionsProps> = props => {
    const {iconOn, iconOff, iconOnTitle, iconOffTitle, reactions, currentUser} = props;
    const reacted = reactions.find(cr => cr.author === currentUser.iri) !== undefined;
    const IconElem = reacted ? iconOn : iconOff;
    const title = reacted ? iconOnTitle : iconOffTitle;
    return <div className="ml-2 d-inline-block">
        <IconElem className="reaction" title={title}/>
        &nbsp;
        {reactions.length}
    </div>
}

export default connect((state: TermItState) => ({currentUser: state.user}))(CommentReactions);
