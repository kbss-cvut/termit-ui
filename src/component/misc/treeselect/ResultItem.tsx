import * as React from "react";
// @ts-ignore
import { ToggleMinusIcon, TogglePlusIcon } from "intelligent-tree-select";
import Utils from "../../../util/Utils";
import { ValueMapper } from "../../../util/Types";
import "./ResultItem.scss";
import Highlighter from "react-highlight-words";

interface ResultItemProps {
  option: any;
  childrenKey: string;
  valueKey: string;
  labelKey: string;
  getOptionLabel: (option: any) => string;
  tooltipKey?: string | ValueMapper<any>;
  className?: string;
  renderAsTree: boolean;
  searchString: string;
  displayInfoOnHover: boolean;
  style?: object;

  addonBefore?: JSX.Element; // Add-on to be rendered before the highlighted option label
  addonAfter?: JSX.Element; // Add-on to be rendered after the highlighted option label

  onMouseEnter?: (option: any) => void;
  onClick?: () => void;
  onToggleClick?: (option: any) => void;
}

/**
 * Custom result item component for the intelligent tree select.
 *
 * It allows us to render additional elements in the tree rows (e.g., icons etc.)
 */
class ResultItem extends React.Component<ResultItemProps> {
  public onClick = () => {
    if (!this.props.option.disabled && this.props.onClick) {
      this.props.onClick();
    }
  };

  public onMouseEnter = () => {
    if (!this.props.option.disabled && this.props.onMouseEnter) {
      this.props.onMouseEnter(this.props.option);
    }
  };

  public onToggle = () => {
    if (!this.props.option.disabled && this.props.onToggleClick) {
      this.props.onToggleClick(this.props.option);
    }
  };

  public render() {
    let button = null;
    const { option, childrenKey, valueKey, labelKey, getOptionLabel } =
      this.props;
    if (option[childrenKey].length > 0) {
      button = this.getCollapseButton();
    }

    const label: string = getOptionLabel
      ? getOptionLabel(option)
      : option[labelKey];
    const value: string = option[valueKey];

    return (
      <div
        className={this.props.className}
        onMouseEnter={this.onMouseEnter}
        style={this.props.style}
      >
        {this.props.renderAsTree && (
          <div className="tree-result-item-toggle-button">{button}</div>
        )}

        <div
          id={`result-item-${Utils.hashCode(value)}`}
          className="result-item"
          onClick={this.onClick}
        >
          {this.props.addonBefore}
          <Highlighter
            highlightClassName="highlighted"
            searchWords={[this.props.searchString]}
            autoEscape={false}
            textToHighlight={label}
            highlightTag="span"
          />
          {this.props.addonAfter}

          {option.fetchingChild && (
            <span className="Select-loading-zone" aria-hidden="true">
              <span className="Select-loading" />
            </span>
          )}
        </div>
      </div>
    );
  }

  private getCollapseButton() {
    return (
      <span onClick={this.onToggle} className="toggleButton">
        {this.props.option.expanded ? <ToggleMinusIcon /> : <TogglePlusIcon />}
      </span>
    );
  }
}

export default ResultItem;
