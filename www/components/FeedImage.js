/** @jsx React.DOM */

var FeedImage = React.createClass({

  render: function() {
    return (
      <div style={styles.container}>
        <img style={styles.img} src={this.props.src} />
      </div>
    );
  }

});

var styles = {
  container: {
    width: 150,
    height: 150,
    overflow: 'hidden',
    display: 'inline-block',
  },
  img: {
    width: '100%',
  },
};

module.exports = FeedImage;
