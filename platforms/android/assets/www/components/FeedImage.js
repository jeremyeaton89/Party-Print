/** @jsx React.DOM */

var React = require('react');
var FeedImage = React.createClass({
  getDefaultProps: function() {
    return {
      selected: false,
    };
  },
  tap: function() {
    var container = this.refs.container.getDOMNode();
    var checkmark = this.refs.checkmark.getDOMNode();
    var img       = this.refs.img.getDOMNode();

    if (this.props.selected) {
      this.props.selected = false;
      $(container).css('border', 'none');
      $(checkmark).hide();
      $(img).attr('data-print', false);
    } else {
      this.props.selected = true;
      $(container).css('border', '3px solid teal');
      $(checkmark).show();
      $(img).attr('data-print', true);
    }
  },
  render: function() {
    return (
      <div 
        ref='container'
        style={styles.container}
        onClick={this.tap}>
        <img 
          ref='img'
          style={styles.img} 
          src={this.props.src} 
        />
        <img 
          ref='checkmark'
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
    width: 160,
    height: 160,
    overflow: 'hidden',
    display: 'inline-block',
    boxSizing: 'border-box',
    margin: 0,
    position: 'relative',
  },
  img: {
    width: '100%',
  },
  checkmark: {
    width: 50,
    height: 50,
    background: 'rgba(255,255,255,0.5)',
    left: 60,
    top: 60,
    borderRadius: 10,
    position: 'absolute',
    display: 'none',
  },
};

module.exports = FeedImage;
