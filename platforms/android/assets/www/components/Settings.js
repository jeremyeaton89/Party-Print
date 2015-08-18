/** @jsx React.DOM */

var React = require('react');

var Header = require('./Header');

var Settings = React.createClass({
  render: function() {
    return (
      <div className='page'>
        <Header left='feed' title='Settings' />

        <div style={styles.settings}>
          <ul>
            <li>Tag: {window.tag ? window.tag : 'input a tag'}</li>
            <li>Printer: </li>
          </ul>
        </div>
      </div>
    );
  }
});

var styles = {
  settings: {
    padding: '100px 10px 10px 10px',
  }
}

module.exports = Settings;
