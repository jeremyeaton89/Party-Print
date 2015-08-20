/** @jsx React.DOM */

var React = require('react');

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
                style={styles.tagInput}
              />
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
  },
  tagLabel: {

  },
  tagInput: {
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
    height: 35,
    padding: '0 10px',
    borderRadius: 9,
    color: 'white',
    fontWeight: 100,
    letterSpacing: 3,
  },
}

module.exports = Settings;
