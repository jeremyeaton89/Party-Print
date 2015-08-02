/** @jsx React.DOM */

var React     = require('react');
var Header    = require('./Header')
var FeedImage = require('./FeedImage');

var Feed = React.createClass({
  getInitialState: function() {
    return {
      imageSources: [], 
    };
  },
  componentDidMount: function() {
    $.getJSON(
      'https://api.instagram.com/v1/tags/tbt/media/recent?callback=?',
      {
        client_id: '90af4f5aec3f4c0caf32d2cf8ed0d257',
      },
      function(response, status) {
        if (status === 'error') {
          console.log('Failed to fetch Images');
        } else {
          var imageSources = response.data.map(function(img) {
            return img.images.standard_resolution.url;
          });
          this.setState({ imageSources: imageSources });
        }
      }.bind(this)
    );
  },
  render: function() {
    var images = [];
    for (var i = 0; i < this.state.imageSources.length; i++) {
      if (this.state.imageSources[i]) {
        images.push(
          <FeedImage src={this.state.imageSources[i]} />
        )
      }
    }
    return (
      <div>
        <Header />
        <div style={styles.imagesContainer}>
          {images}
        </div>
      </div>
    );
  }
});

var styles = {
  imagesContainer: {
    width: 320,
    height: '100%',
    // backgroundColor: 'rgba(0,0,0,0.25)',
    margin: '0 auto',
  },
}

module.exports = Feed;
