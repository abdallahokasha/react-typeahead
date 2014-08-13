/**
 * @jsx React.DOM
 */

var React = window.React || require('react');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = React.createClass({
  propTypes: {
    options: React.PropTypes.array,
    defaultSelected: React.PropTypes.array,
    defaultValue: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      selected: this.props.defaultSelected
    };
  },

  getDefaultProps: function() {
    return {
      options: [],
      defaultSelected: [],
      defaultValue: ""
    };
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function() {
    var result = this.state.selected.map(function(selected) {
      return <Token key={ selected } onRemove={ this._removeTokenForValue }>{ selected }</Token>;
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function() {
    // return this.props.options without this.selected
    return this.props.options
  },

  _onKeyDown: function(event) {
    // We only care about intercepting backspaces
    if (event.keyCode !== KeyEvent.DOM_VK_BACK_SPACE) {
      return true;
    }

    // No tokens
    if (!this.state.selected.length) {
      return true;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.refs.typeahead.refs.entry.getDOMNode();
    if (entry.selectionStart == entry.selectionEnd &&
        entry.selectionStart == 0) {
      this._removeTokenForValue(
        this.state.selected[this.state.selected.length - 1]);
      return false;
    }

    return true;
  },

  _removeTokenForValue: function(value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return false;
    }

    this.state.selected.splice(index, 1);
    this.setState({selected: this.state.selected});
    return false;
  },

  _addTokenForValue: function(value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({selected: this.state.selected});
    this.refs.typeahead.setEntryText("");
  },

  render: function() {
    return <div>
      { this._renderTokens() }
      <Typeahead ref="typeahead" options={this._getOptionsForTypeahead()}
        defaultValue={this.props.defaultValue} 
        onOptionSelected={this._addTokenForValue} 
        onKeyDown={this._onKeyDown} />
    </div>
  }
});

module.exports = TypeaheadTokenizer;
