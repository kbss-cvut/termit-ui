import * as React from "react";
import withI18n, {HasI18n} from "../hoc/withI18n";
import TextArea from "../misc/TextArea";
import {Button, ButtonToolbar} from "reactstrap";
import {injectIntl} from "react-intl";
import Comment from "../../model/Comment";
import Constants from "../../util/Constants";

interface CreateCommentFormProps extends HasI18n {
    onSubmit: (comment: Comment) => Promise<any>;
}

const CreateCommentForm: React.FC<CreateCommentFormProps> = props => {
    const {i18n, onSubmit} = props;
    const [content, setContent] = React.useState("");
    const [submitting, setSubmitting] = React.useState(false);
    const submit = () => {
        setSubmitting(true);
        onSubmit(new Comment({content})).then(() => {
            setContent("");
            setSubmitting(false);
        });
    };

    return <div className="comments-create mt-3">
        <TextArea value={content} onChange={(e) => setContent(e.target.value)}
                  placeholder={i18n("comments.create.placeholder")} rows={5}/>
        <ButtonToolbar className="justify-content-end">
            <Button color={Constants.SUBMIT_BUTTON_VARIANT} id="comment-submit" size="sm"
                    disabled={content.trim().length === 0 || submitting}
                    onClick={submit}>{i18n("comments.create.submit.title")}</Button>
        </ButtonToolbar>
    </div>;
};

export default injectIntl(withI18n(CreateCommentForm));
