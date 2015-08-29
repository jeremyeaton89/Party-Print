/** @jsx React.DOM */

var React = require('react');
var Utils = require('../utils');

var UserSearchItem = React.createClass({
  render: function() {
    return (
      <li 
        style   = {Utils.merge(styles.container, { width: this.props.width })}
        onClick = {this.props.onClick}>
        <img 
          src={this.props.src} 
          style={styles.img}
        />
        <div style={styles.username}>
          {this.props.username}
        </div>
      </li>
    );
  }
});

var styles = {
  container: {
    height: 40,
    position: 'relative',
    width: '100%',
    borderLeft: '1px solid gray',
    borderRight: '1px solid gray',
    borderBottom: '1px solid lightgray',
    cursor: 'pointer',
  },
  img: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 20,
    top: 5,
    left: 10,
  },
  username: {
    position: 'absolute',
    height: 20,
    fontSize: 16,
    top: 12,
    left: 55,
    right: 0,
    color: '#5E5E5E',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}

module.exports = UserSearchItem;
