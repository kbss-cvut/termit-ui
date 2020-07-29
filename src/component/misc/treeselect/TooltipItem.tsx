import * as React from "react";
import {Tooltip} from "reactstrap";
import Highlighter from "react-highlight-words";
import {ValueMapper} from "../../../util/Types";

interface TooltipItemProps {
    targetId: string;
    displayOnHover: boolean;
    searchString: string;
    option: any;
    label: string;
    tooltipKey?: string | ValueMapper<any>;
    addonBefore?: JSX.Element;  // Add-on to be rendered before the highlighted option label
    addonAfter?: JSX.Element;   // Add-on to be rendered after the highlighted option label

    onClick: () => void;
}

interface TooltipItemState {
    displayTooltip: boolean;
}

class TooltipItem extends React.Component<TooltipItemProps, TooltipItemState> {
    constructor(props: TooltipItemProps) {
        super(props);
        this.state = {
            displayTooltip: false
        };
    }

    private onToggle = () => {
        this.setState({displayTooltip: !this.state.displayTooltip});
    };

    public onClick = () => {
        this.setState({displayTooltip: false});
        this.props.onClick();
    };

    public render() {
        return <div id={this.props.targetId} className="result-item" onClick={this.onClick}>
            {this.props.addonBefore}
            <Highlighter
                highlightClassName="highlighted"
                searchWords={[this.props.searchString]}
                autoEscape={false}
                textToHighlight={this.props.label}
                highlightTag="span"
            />
            {this.props.addonAfter}
            {this.props.displayOnHover &&
            <Tooltip innerClassName="VirtualizedTreeSelectTooltip"
                     style={{left: "400px!important"}}
                     placement="left" isOpen={this.state.displayTooltip}
                     target={this.props.targetId} autohide={false}
                     toggle={this.onToggle} delay={{"show": 300, "hide": 0}}
                     modifiers={{
                         preventOverflow: {
                             escapeWithReference: false,
                         },
                     }}
            >
                {this.getTooltipData()}
            </Tooltip>
            }
        </div>
    }

    private getTooltipData() {
        const {tooltipKey, option} = this.props;
        if (!tooltipKey) {
            return null;
        }
        if (typeof tooltipKey === "function") {
            return tooltipKey(option);
        } else {
            return option[tooltipKey];
        }
    }
}

export default TooltipItem;