/** @jsx React.DOM */

var React              = require('react/addons');
var CSSTransitionGroup = React.addons.CSSTransitionGroup;

var Utils = require('../utils');

var FeedImage = React.createClass({
  enqueueImage: function() {
    var $checkmark = $(this.refs.checkmark.getDOMNode()),
        $img       = $(this.refs.img.getDOMNode());

    $checkmark.css('opacity', 1);
    $img.css('opacity', 0.5);

    setTimeout(function() {
      $checkmark.css('opacity', 0);
      $img.css('opacity', 1);
    }, 1000);

    var imgData = {
      src: this.props.src,
      printURL: this.props.printURL,
    }

    this.props.enqueueImage(imgData)
  },
  render: function() {
    return (
      <div 
        style={styles.container}
        onClick={this.enqueueImage}>
        <img 
          ref='img'
          className='feed-image fade'
          style={styles.img} 
          src='img/dummy-img.png'
          data-src={this.props.src}
          data-print-url={this.props.printURL}
          data-page={this.props.page}
        />
        <img 
          ref='checkmark'
          className='fade'
          style={styles.checkmark} 
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
    cursor: 'pointer',
    visibility: 'hidden',
  },
  checkmark: {
    width: 50,
    height: 50,
    background: 'rgba(255,255,255,0.5)',
    left: 50,
    top: 50,
    borderRadius: 10,
    position: 'absolute',
    opacity: 0,
    'cursor': 'pointer',
  },
};

module.exports = FeedImage;
