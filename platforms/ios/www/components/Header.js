/** @jsx React.DOM */

var React = require('react');
var Utils = require('../utils');
var Link  = require('react-router-component').Link;


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
  filter: function() {
    var searchValue = this.refs.searchBar.getDOMNode().value;
    var $xIcon      = $(this.refs.xIcon.getDOMNode());

    if (searchValue.length) {
      $('#feedContainer div:not([data-username^="'+searchValue+'"])').hide();
      $('#feedContainer div[data-username^="'+searchValue+'"]').show();
      $xIcon.show();
    } else {
      $('#feedContainer div').show();
      $xIcon.hide();
    }
  },
  handleBlur: function() {
    setTimeout(function() {
      if (this.xIconClick) {
        this.xIconClick = false;
      } else {
        if (!this.refs.searchBar.getDOMNode().classList.contains('invisible')) this.animateSearchBar(); // if user taps 'done'
        this.props.searchHandlers.blur();
      }
    }.bind(this), 200)
  },
  clearSearchBar: function() {
    $(this.refs.searchBar.getDOMNode()).val('').focus();
    $(this.refs.xIcon.getDOMNode()).hide();
    $('#feedContainer div').show();
  },
  render: function() {
    var left   = '';
    var middle = '';
    var right  = ''; 

    switch(this.props.left) {
      case 'settings': 
          left = 
            <Link
              noTransition
              href='/settings'
              style={Utils.merge(styles.iconContainer, { left: 10 })}>
              <div style={Utils.merge(styles.icon, { backgroundImage: 'url(img/settings-icon.png)'})}></div>
            </Link> 
        break;
    }
    switch(this.props.middle) {
      case 'search': 
        var searchBarWidth = window.innerWidth - 120;

        middle = 
          <div>
            <input 
              type='search' 
              ref='searchBar'
              placeholder='Search by Username'
              style={Utils.merge(styles.searchBar, { width: searchBarWidth })}
              onChange={this.filter}
            />
            <div 
              ref='xIcon'
              style={styles.xIconContainer}
              onClick={this.clearSearchBar}>
              <img 
                src='img/x-icon.png'
                style={styles.xIcon}
              />
            </div>
          </div>
        break;
    }
    switch(this.props.right) {
      case 'print':
        right = 
          <a
            style={Utils.merge(styles.iconContainer, { right: 10 })}>
            <div style={Utils.merge(styles.icon, { backgroundImage: 'url(img/printer-icon.png)'})}></div>
          </a>
        break;
    }

    return (
      <div style={styles.container} >
        {left}
        {middle}
        {right}
      </div>
    );
  }
});

var styles = {
  container: {
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
    left: 60,
    position: 'absolute',
    width: 200,
    top: 15,
    outline: 'none',
    borderRadius: 20,
    padding: '5px 30px 3px 15px',
    boxSizing: 'border-box',
    height: 33,
    border: 'none',
    fontSize: 14,
    color: 'gray',
  },
  printButton: {
    position: 'absolute',
    top: 20,
    right: 10,
  },
  xIcon: {
    width: 12,
    height: 12,
    position: 'relative',
    top: -3.5,
    left: 3,
  },
  xIconContainer: {
    background: 'rgba(0, 0, 0, 0.33)',
    width: 18,
    height: 18,
    borderRadius: 21,
    position: 'absolute',
    top: 23,
    right: 70,
    zIndex: 3,
    cursor: 'pointer',
    display: 'none',
  },
  icon: {
    height: 25,
    width: 25,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    margin: '10px auto',  
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    width: 50,
    height: 50,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  title: {
    fontFamily: 'Indie Flower',
    color: 'white',
    textAlign: 'center',
    margin: 0,
    position: 'relative',
    left: '-50%',
    height: 52,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  titleContainer: {
    position: 'absolute',
    left: '50%',
    width: '75%',
    top: 28,
  },
}

module.exports = Header;
