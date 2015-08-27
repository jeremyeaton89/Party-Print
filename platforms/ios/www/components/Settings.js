/** @jsx React.DOM */

var React = require('react');
var Utils = require('../utils');

var Header = require('./Header');

var Settings = React.createClass({
  focusTagInput: function() {
    $(this.refs.tag.getDOMNode()).focus();
  },
  updateTag: function() {
    var $input = $(this.refs.tag.getDOMNode());
    var value  = $input.val().trim().replace('#', '');
    if (value) {
      window.tag = value;
      $input.val('#'+value);
    }
  },
  focusAgeLimitInput: function() {
    $(this.refs.ageLimit.getDOMNode()).focus();
  },
  validateAgeLimit: function() {
    var $input = $(this.refs.ageLimit.getDOMNode());
    var value  = $input.val();

    if (value.length && !value.match(/^[1-9]\d{0,2}$/))
      $input.val(value.slice(0,-1));
  },
  saveAgeLimit: function() {
    var $input     = $(this.refs.ageLimit.getDOMNode());
    var $hoursText = $(this.refs.hoursText.getDOMNode());

    if (!$input.val()) {
      $input.val(6);
      window.ageLimit = 6;
    } else {
      window.ageLimit = $input.val();
    }
    window.ageLimit == 1 ? $hoursText.html('hour') : $hoursText.html('hours');
  },
  selectPrinter: function() {
    window.plugin.printer.print('');
  },
  render: function() {
    return (
      <div className='page'>
        <Header left='feed' title='Settings' />

        <div style={styles.container}>
          <ul style={styles.list}>
            <li 
              style={styles.row}
              onClick={this.focusTagInput}>
              <label 
                style={styles.tagLabel}
                htmlFor='tag'>
                Tag:
              </label>
              <input 
                ref='tag'
                type='text' 
                name='tag' 
                placeholder='input a #tag'
                defaultValue={window.tag ? ('#'+window.tag) : null}
                onBlur={this.updateTag}
                style={styles.input}
              />
            </li>
            <li
              style={styles.row}
              onClick={this.focusAgeLimitInput}>
              <label
                style={styles.tagLabel}
                htmlFor='ageLimit'>
                Age Limit:
              </label>
              <input
                ref='ageLimit'
                type='text'
                defaultValue={window.ageLimit ? window.ageLimit : 6}
                onKeyUp={this.validateAgeLimit}
                onBlur={this.saveAgeLimit}
                style={Utils.merge(styles.input, { width: 40 })}
              />
              <span 
                ref='hoursText'
                style={{ color: 'gray' }}>
                hours
              </span>
            </li>
          </ul>
          <div style={styles.printerButtonContainer}>
            <button 
              style={styles.printerButton}
              onClick={this.selectPrinter}>
              Select a printer
            </button>
          </div>
        </div>
      </div>
    );
  }
});

var styles = {
  container: {
    padding: '100px 10px 10px 10px',
  },
  list: {
    listStyleType: 'none',
    padding: '0 10px',
  },
  row: {
    width: '100%',
    height: 35,
    borderBottom: '1px solid lightgray',
    cursor: 'pointer',
    fontSize: 22,
    marginBottom: 10,
  },
  tagLabel: {

  },
  input: {
    outline: 'none',
    border: 'none',
    padding: '0 0 0 10px',
    cursor: 'pointer',
    color: 'gray',
    height: 32,
  },
  printerButtonContainer: {
    paddingLeft: 10,
  },
  printerButton: {
    backgroundColor: 'gray',
    border: 'none',
    outline: 'none',
    height: 35,
    padding: '0 10px',
    borderRadius: 9,
    color: 'white',
    fontWeight: 100,
    letterSpacing: 3,
  },
}

module.exports = Settings;
