/** @jsx React.DOM */

var React = require('react');

var Header = React.createClass({
  print: function() {
    var page = '';
    $('img[data-print="true"]').each(function(i, el) {
      page += el.outerHTML;
    })
    console.log(page);
    window.plugin.printer.print(page);
  },
  render: function() {
    return (
      <div style={styles.header} >
        <button onClick={this.print}>Print</button>
      </div>
    );
  }

});

var styles = {
  header: {
    width: '100%',
    height: 60,
    background: 'gray',
  }
}

module.exports = Header;
