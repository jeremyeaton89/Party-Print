/** @jsx React.DOM */

var React = require('react');

var Header = React.createClass({
  componentDidMount: function() {
    this.addListeners();
  },
  addListeners: function() {
    var header = this.refs.header.getDOMNode();

    $(this.refs.searchBar.getDOMNode()).focus(function() {
      $(header).css('position', 'absolute');
    }).blur(function() {
      $(header).css('position', 'fixed');
    });
  },
  print: function() {
    // TODO: get hi res photos
    var page = '';
    $('img[data-print="true"]').each(function(i, el) {
      page += el.outerHTML;
    })
    console.log(page);
    window.plugin.printer.print(page);
  },
  filter: function() {
    var searchValue = this.refs.searchBar.getDOMNode().value;
    if (searchValue.length) {
      $('#feedContainer div:not([data-username^="'+searchValue+'"])').hide();
      $('#feedContainer div[data-username^="'+searchValue+'"]').show();
    } else {
      $('#feedContainer div').show();
    }
  },
  render: function() {
    return (
      <div 
        ref='header'
        style={styles.header} >

        <button
          style={styles.settingsButton}
          onClick={this.showSettings}>
          Settings
        </button>

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
    background: 'rgba(255, 0, 0, 0.67)',
    position: 'absolute',
    zIndex: 2,
    top: 0,
  },
  settingsButton: {
    position: 'absolute',
    top: 20,
    left: 10,
  },
  searchBar: {
    left: 'calc(50% - 100px)',
    position: 'absolute',
    width: 200,
    top: 20,
  },
  printButton: {
    position: 'absolute',
    top: 20,
    right: 10,
  }
}

module.exports = Header;
