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
  componentDidMount: function() {
    if (this.props.selected) {
      this.setState({
        selected: this.props.selected
      });
    }
  },
  toggleSelected: function() {
    this.state.selected = !this.state.selected;
    this.setState({
      selected: this.state.selected
    });

    var imgData = {
      src: this.props.src,
      printURL: this.props.printURL,
      selected: this.state.selected,
    }

    this.props.handlePrintQueue(imgData)
  },
  render: function() {
    var selected         = this.state.selected;
    var displayContainer = this.props.hide ? 'none'              : 'inline-block';
    var displayCheckmark = selected        ? 'block'             : 'none';
    var border           = selected        ? '3px solid #37CBCB' : 'none';

    return (
      <div 
        style={Utils.merge(styles.container, {border: border, display: displayContainer})}
        onClick={this.toggleSelected}>
        <img 
          className='feed-image'
          data-src={this.props.src}
          data-print-url={this.props.printURL}
          data-page={this.props.page}
          style={styles.img} 
          src='img/dummy-img.png'
        />
        <img 
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
  },
  img: {
    width: '100%',
    visibility: 'hidden',
    cursor: 'pointer',
  },
  checkmark: {
    width: 50,
    height: 50,
    background: 'rgba(255,255,255,0.5)',
    left: 50,
    top: 50,
    borderRadius: 10,
    position: 'absolute',
    display: 'none',
    'cursor': 'pointer',
  },
};

module.exports = FeedImage;
