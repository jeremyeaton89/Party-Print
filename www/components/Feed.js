/** @jsx React.DOM */

var React              = require('react/addons');
var CSSTransitionGroup = React.addons.CSSTransitionGroup;

var Header    = require('./Header')
var FeedImage = require('./FeedImage');

var Feed = React.createClass({
  getInitialState: function() {
    return {
      images: [],
    };
  },
  getDefaultProps: function() {
    return {
      maxTagId: null,
      atBottom: true,
    };
  },
  componentDidMount: function() {
    this.getImages();
    this.props.interval = setInterval(function() {
      this.getImages();
    }.bind(this), 10000); 
  },
  componentWillUpdate: function(nextProps, nextState) {
    var feedContainerHeight = $(this.refs.feedContainer.getDOMNode()).height();
    this.props.atBottom = (window.innerHeight >= feedContainerHeight) || (window.innerHeight + window.scrollY) >= feedContainerHeight);
  },
  componentDidUpdate: function() {
    if (this.props.atBottom) {
      $('html, body').animate({
        scrollTop: $(this.refs.feedContainer.getDOMNode()).height()
      }, 2000);
    }
  },
  getImages: function() {
    $.getJSON(
      'https://api.instagram.com/v1/tags/tbt/media/recent?count=4&max_tag_id='+this.props.maxTagId+'&callback=?',
      {
        client_id: '90af4f5aec3f4c0caf32d2cf8ed0d257',
      },
      function(response, status) {
        if (status === 'error') {
          console.log('Failed to fetch Images');
        } else {
          this.props.maxTagId = response.pagination.next_max_tag_id;

          response.data.forEach(function(img) {
            var inputVal  = $('input[type=search]').val().trim();
            var searchVal = inputVal ? ('^' + inputVal) : '';
            var username  = img.user.username;
            this.state.images.push(
              <FeedImage 
                src={img.images.low_resolution.url}
                username={username}
                hide={searchVal.length && username.match(searchVal)}
              />
            );
          }.bind(this));

          this.setState({ images: this.state.images });
        }
      }.bind(this)
    );
  },
  pause: function() {
    clearInterval(this.props.interval);
  },
  render: function() {
    return (
      <div ref='feedContainer' id='feedContainer'>
        <Header />
        <button id='pause' onClick={this.pause} style={{position: 'fixed', left: 10, top: 10, zIndex: 99999}}>pause</button>
        <div 
          ref='imagesContainer' 
          style={styles.imagesContainer}>

          {this.state.images}

        </div>
      </div>
    );
  }
});

var styles = {
  imagesContainer: {
    width: 320,
    height: '100%',
    margin: '0 auto',
  },
}

module.exports = Feed;
