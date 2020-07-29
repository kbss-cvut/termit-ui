import * as React from "react";

/**
 * Contains just the editing state indicator.
 */
export interface EditableComponentState {
    edit: boolean;
}

/**
 * Represents a component which can be put into an 'edit' state.
 *
 * Typically, this state will switch the UI content and allow the user to perform editing, after which the state
 * changes back to read only.
 */
export default class EditableComponent<P = {}, S extends EditableComponentState = EditableComponentState> extends React.Component<P, S> {

    public onEdit = () => {
        this.setState({edit: true});
    };

    public onCloseEdit = () => {
        this.setState({edit: false});
    };
}