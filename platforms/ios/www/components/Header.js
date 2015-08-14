/** @jsx React.DOM */

var React = require('react');

var Header = React.createClass({
  print: function() {
    // TODO: get hi res photos
    var page = '';
    $('img[data-print="true"]').each(function(i, el) {
      page += el.outerHTML;
    })
    console.log(page);
    window.plugin.printer.print(page);
  },
  filter: function(a) {
    var searchValue = this.refs.searchBar.getDOMNode().value;
    if (searchValue.length) {
      $('#imagesContainer div:not([data-username^="'+searchValue+'"])').hide();
      $('#imagesContainer div[data-username^="'+searchValue+'"]').show();
    } else {
      $('#imagesContainer div').show();
    }
  },
  render: function() {
    return (
      <div style={styles.header} >
        <input 
          type='search' 
          ref='searchBar'
          placeholder='Search by Username'
          style={styles.searchBar}
          onChange={this.filter}
        />
        <button 
          style={styles.printButton} 
          onClick={this.print}>
          Print
        </button>
      </div>
    );
  }

});

var styles = {
  header: {
    width: '100%',
    height: 60,
    background: 'gray',
  },
  searchBar: {
    position: 'absolute',
    top: 20,
    left: 40,
  },
  printButton: {
    position: 'absolute',
    top: 20,
    right: 0,
  }
}

module.exports = Header;
