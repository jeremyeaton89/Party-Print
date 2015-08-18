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
    var interval = setInterval(function() {
      this.getImages();
    }.bind(this), 10000); 
    this.props.interval = interval; // TODO: remove pause
    window.onhashchange = function() {
      clearInterval(interval);
    }

    this.addScrollListener();
  },
  componentWillUpdate: function(nextProps, nextState) {
    var $feedContainer = $(this.refs.feedContainer.getDOMNode());
    var feedContainerHeight = $(this.refs.feedContainer.getDOMNode()).innerHeight();
    $('#imagesContainer').scrollTop() + $('#imagesContainer').innerHeight()

    this.props.atBottom = (($feedContainer[0].scrollHeight === $feedContainer.innerHeight()) || 
                          ($feedContainer.scrollTop() + $feedContainer.innerHeight()) >=  $feedContainer[0].scrollHeight);
  },
  componentDidUpdate: function() {
    if (this.props.atBottom) {
      var $feedContainer = $(this.refs.feedContainer.getDOMNode());

      this.props.scrolling = true;
      $feedContainer.animate({
        scrollTop: $feedContainer[0].scrollHeight
      }, 2000, function() {
        this.props.scrolling = false;
      }.bind(this));
    }
  },
  getImages: function() {
    $.getJSON(
      'https://api.instagram.com/v1/tags/'+window.tag+'/media/recent?count=4&max_tag_id='+this.props.maxTagId+'&callback=?',
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
  addScrollListener: function() {
    var $feedContainer = $(this.refs.feedContainer.getDOMNode());
    var $scrollButton  = $(this.refs.scrollButton.getDOMNode());
    var curScrollTop   = 0;

    $feedContainer.scroll(function() {
      var prevScrollTop = curScrollTop;
      setTimeout(function() {
        curScrollTop = $feedContainer.scrollTop();
        if (((curScrollTop !== prevScrollTop) && curScrollTop + $feedContainer.innerHeight()) <  $feedContainer[0].scrollHeight &&
          this.props.scrolling === false) {
          $scrollButton.fadeIn(300);
        } else if ($scrollButton.is(':visible') && this.props.scrolling === false) {
          $scrollButton.fadeOut(300);
        }  
      }.bind(this), 200);
    }.bind(this))
  },
  scrollToBottom: function() {
    var $feedContainer = $(this.refs.feedContainer.getDOMNode());

    $(this.refs.scrollButton.getDOMNode()).fadeOut(200);
    this.props.scrolling = true;
    $feedContainer.animate({
      scrollTop: $feedContainer[0].scrollHeight
    }, Math.max(2000, ($feedContainer[0].scrollHeight - $feedContainer.scrollTop())), function() {
      this.props.scrolling = false;
    }.bind(this));
  },
  pause: function() {
    clearInterval(this.props.interval);
  },
  render: function() {
    return (
      <div className='page'>
        <Header left='settings' middle='search' right='print'/>
        <button id='pause' onClick={this.pause} style={{position: 'fixed', left: 10, top: 100, zIndex: 99999}}>pause</button>
        <div 
          ref='feedContainer' 
          id='feedContainer'
          style={styles.feedContainer}>

          {this.state.images}

        </div>
        <div style={styles.scrollButtonContainer}>
          <div 
            ref='scrollButton'
            style={styles.scrollButton}
            onClick={this.scrollToBottom}>
            Most Recent
            <div style={styles.downArrow}></div>
          </div>
        </div>
      </div>
    );
  }
});

var styles = {
  feedContainer: {
    width: '100%',
    height: '100%',
    margin: '0 auto',
    paddingTop: 70,
    paddingLeft: 'calc(50% - 150px)',
    paddingRight: 'calc(50% - 165px)',
    boxSizing: 'border-box',
    overflowY: 'scroll',
    WebkitOverflowScrolling: 'touch',
  },
  scrollButtonContainer: {
    position: 'absolute',
    left: '50%',
    bottom: 10,
  },
  scrollButton: {
    cursor: 'pointer',
    width: 100,
    height: 30,
    borderRadius: 20,
    background: 'rgba(140,129,129,0.67)',
    textAlign: 'center',
    position: 'relative',
    color: 'white',
    display: 'none',
    fontWeight: 100,
    left: '-50%',
    display: 'none',
    fontSize: 14,
  },
  downArrow: {
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '8px solid white',
    position: 'relative',
    width: 0,
    height: 0,
    left: 47,
  },
}

module.exports = Feed;
