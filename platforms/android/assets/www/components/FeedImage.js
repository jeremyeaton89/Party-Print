/** @jsx React.DOM */

var React              = require('react/addons');
var CSSTransitionGroup = React.addons.CSSTransitionGroup;

var Utils = require('../utils');

var FeedImage = React.createClass({
  getInitialState: function() {
    return {
      selected: false,
    };
  },
  toggleSelected: function() {
    this.setState({
      selected: !this.state.selected
    });
  },
  componentDidMount: function() {
    setTimeout(function() {
      this.refs.container.getDOMNode().style.opacity = 1;  
    }.bind(this), 200);
  },
  render: function() {
    var selected         = this.state.selected;
    var displayContainer = this.props.hide ? 'none'           : 'inline-block';
    var displayCheckmark = selected        ? 'block'          : 'none';
    var border           = selected        ? '3px solid teal' : 'none';

    return (
      <div 
        ref='container'
        className='fade'
        style={Utils.merge(styles.container, {border: border, display: displayContainer})}
        onClick={this.toggleSelected}
        data-username={this.props.username}>
        <img 
          ref='img'
          data-print={selected}
          style={styles.img} 
          src={this.props.src} 
        />
        <img 
          ref='checkmark'
          style={Utils.merge(styles.checkmark, {display: displayCheckmark})} 
          src='img/checkmark-icon.png'
        />
      </div>
    );
  }
});

var styles = {
  container: {
    cursor: 'pointer',
    width: 150,
    height: 150,
    overflow: 'hidden',
    display: 'inline-block',
    boxSizing: 'border-box',
    margin: 0,
    position: 'relative',
    opacity: 0,
  },
  img: {
    width: '100%',
  },
  checkmark: {
    width: 50,
    height: 50,
    background: 'rgba(255,255,255,0.5)',
    left: 55,
    top: 55,
    borderRadius: 10,
    position: 'absolute',
    display: 'none',
  },
};

module.exports = FeedImage;
