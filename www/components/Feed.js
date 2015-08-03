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
  getDefaultProps: function() {
    return {
      maxTagId: null,
    };
  },
  componentDidMount: function() {
    setInterval(function() {
      this.getImages();
    }.bind(this), 1000); 
  },
  getImages: function() {
    $.getJSON(
      'https://api.instagram.com/v1/tags/partyprinttest/media/recent?count=100&max_tag_id='+this.props.maxTagId+'&callback=?',
      {
        client_id: '90af4f5aec3f4c0caf32d2cf8ed0d257',
      },
      function(response, status) {
        if (status === 'error') {
          console.log('Failed to fetch Images');
        } else {
          console.log('RESP', response);
          this.props.maxTagId = response.pagination.next_max_tag_id;
          response.data.forEach(function(img) {
            this.state.imageSources.push(img.images.standard_resolution.url);
          }.bind(this));

          this.setState({ imageSources: this.state.imageSources });
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
          {images.reverse()}
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
