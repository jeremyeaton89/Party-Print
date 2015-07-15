/** @jsx React.DOM */

var FeedImage = require('./FeedImage');

var Feed = React.createClass({
  getInitialState: function() {
    return {
      imageSources: [], 
    };
  },
  componentWillMount: function() {
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
        {images}
      </div>
    );
  }
});

module.exports = Feed;
