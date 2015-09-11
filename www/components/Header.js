/** @jsx React.DOM */

var React = require('react');
var Utils = require('../utils');
var Link  = require('react-router-component').Link;

var UserLi = require('./UserSearchItem');

var Header = React.createClass({
  getInitialState: function() {
    return {
      searchList: [], 
    };
  },
  print: function() {
    var page = '';
    window.printQueue.forEach(function(img) {
      page += $('<img />').attr('src', img.printURL).css({
        width:   '100%',
        display: 'inline-block',
      })[0].outerHTML;
    });

    setTimeout(function() {
      window.plugin.printer.print(page);
      for (var i = 0; i < window.printQueue.length; i++) {
        this.props.dequeueImage(i);
      }
    }.bind(this), 200);
  },
  fetchMatches: function() {
    if (!window.tag) {
      this.refs.searchBar.getDOMNode().value = '';
      return;
    }

    var searchValue = this.refs.searchBar.getDOMNode().value.replace('@', '');
    var $xIcon      = $(this.refs.xIcon.getDOMNode());

    if (searchValue.length) {
      $xIcon.css('visibility', 'visible');
      $.getJSON(
        'https://api.instagram.com/v1/users/search?q='+searchValue+'&count=10&callback=?',
        {
          client_id: '90af4f5aec3f4c0caf32d2cf8ed0d257',
        },
        function(response, status) {
          if (status === 'error') {
            console.log('Failed to fetch Users');
          } else {
            var userListItems = response.data.map(function(user, i) {
              return (
                <UserLi
                  username={'@'+user.username}
                  src={user.profile_picture}
                  onClick={this.getUserImages.bind(this, user.id, user.username)}
                />
              );
            }.bind(this));

            this.setState({ searchList: userListItems });
          }
        }.bind(this)
      );
    } else {
      $xIcon.css('visibility', 'hidden');
    }
  },
  getUserImages: function(userId, username) {
    $(this.refs.searchBar.getDOMNode()).val('@'+username);
    this.setState({ searchList: [] });
    this.props.getUserImages(userId);
  },
  clearSearchBar: function() {
    $(this.refs.searchBar.getDOMNode()).val('').focus();
    $(this.refs.xIcon.getDOMNode()).css('visibility', 'hidden');
    this.setState({ searchList: [] });
    this.props.getRecentImages();
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
            href       = '/settings'
            style      = {Utils.merge(styles.iconContainer, { left: 10 })}>
            <div style = {Utils.merge(styles.icon, { backgroundImage: 'url(img/settings-icon.png)'})}></div>
          </Link> 
        break;
      case 'feed':
        left = 
          <Link
            noTransition
            href       = '/'
            style      = {Utils.merge(styles.iconContainer, { left: 10 })}>
            <div style = {Utils.merge(styles.icon, { backgroundImage: 'url(img/feed-icon.png)', width: 30, height: 30 })}></div>
          </Link> 
    }
    switch(this.props.middle) {
      case 'search': 
        var searchBarWidth = Math.min((window.innerWidth - 120), 400);

        middle = 
          <div style={styles.searchBarContainer}>
            <input 
              type        = 'search' 
              ref         = 'searchBar'
              placeholder = 'Search by Username'
              style       = {Utils.merge(styles.searchBar, { width: searchBarWidth })}
              onChange    = {this.fetchMatches}
            />
            <div 
              ref     = 'xIcon'
              style   = {styles.xIconContainer}
              onClick = {this.clearSearchBar}>
              <img 
                src='img/x-icon.png'
                style={styles.xIcon}
              />
            </div>
            <ul 
              ref   = 'searchList'
              style = {Utils.merge(styles.searchList, { width: searchBarWidth })}>
              {this.state.searchList}
            </ul>
          </div>
        break;
      default:
        middle = 
          <div style={styles.titleContainer}>
            <h1 
              ref   = 'title' 
              style = {styles.title}>
              {this.props.title}
            </h1>
          </div>
    }
    switch(this.props.right) {
      case 'print':
        right = 
          <a
            style      = {Utils.merge(styles.iconContainer, { right: 10 })}
            onClick    = {this.print}>
            <div style = {Utils.merge(styles.icon, { backgroundImage: 'url(img/printer-icon.png)'})}></div>
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
    height: 70,
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
  searchBarContainer: {
    position: 'absolute',
    left: '50%',
  },
  searchBar: {
    left: 60,
    position: 'relative',
    left: '-50%',
    width: 200,
    top: 25,
    outline: 'none',
    borderRadius: 20,
    padding: '5px 30px 3px 15px',
    boxSizing: 'border-box',
    height: 33,
    border: 'none',
    fontSize: 14,
    color: 'gray',
  },
  searchList: {
    position: 'relative',
    top: 19,
    left: '-50%',
    width: 200,   
    padding: 0,
    margin: 0,
    zIndex: 3,
    listStyleType: 'none',
    background: 'white',
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
    position: 'relative',
    left: '43%',
    left: 'calc(50% - 27px)',
    zIndex: 3,
    cursor: 'pointer',
    visibility: 'hidden',
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
    top: 20,
    width: 50,
    height: 50,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  title: {
    fontFamily: 'Special Elite, cursive',
    fontWeight: 100,
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
    top: 25,
  },
  printButton: {
    position: 'absolute',
    top: 20,
    right: 10,
  },
}

module.exports = Header;
