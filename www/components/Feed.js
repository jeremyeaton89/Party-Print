/** @jsx React.DOM */

var React = require('react');

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
    if (!window.tag) {
      $(this.refs.promptContainer.getDOMNode()).fadeIn(300, function() {
        this.addPromptHandlers();
        $(this.refs.promptInput.getDOMNode()).val('#').focus();
      }.bind(this));
    } else {
      this.addImageFetcher();
      this.addScrollListener();  
    }
  },
  componentWillUpdate: function() {
    var $feedContainer  = $(this.refs.feedContainer.getDOMNode());

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
  addPromptHandlers: function() {
    $(this.refs.promptButton.getDOMNode()).click(function() {
      var value = $(this.refs.promptInput.getDOMNode()).val().trim().replace('#', '');
      if (value) {
        $(this.refs.promptContainer.getDOMNode()).fadeOut(500);
        window.tag = value;
        this.addImageFetcher();
        this.addScrollListener();  
      } else {
        alert('You must choose a #tag to start the feed', null, 'Wait a Sec!', 'Got it!');
      }
    }.bind(this));
  },
  addImageFetcher: function() {
    this.getImages();
    var interval = setInterval(function() {
      this.getImages();
    }.bind(this), 10000); 
    this.props.interval = interval; // TODO: remove pause
    window.onhashchange = function(e) {
      if (e.newURL.split('#')[1] !== '/')
        clearInterval(interval);
    }
  },
  getImages: function() {
    $.getJSON(
      'https://api.instagram.com/v1/tags/'+window.tag+'/media/recent?count=100&max_tag_id='+this.props.maxTagId+'&callback=?',
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
                printURL={img.images.standard_resolution.url}
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
    }, Math.max(2000, Math.min(4000, ($feedContainer[0].scrollHeight - $feedContainer.scrollTop()))), function() {
      this.props.scrolling = false;
    }.bind(this));
  },
  pause: function() {
    clearInterval(this.props.interval);
    // <button id='pause' onClick={this.pause} style={{position: 'fixed', left: 10, top: 100, zIndex: 99999}}>pause</button>
  },
  render: function() {
    return (
      <div className='page'>
        <Header left='settings' middle='search' right='print'/>

        <div 
          ref='promptContainer'
          style={styles.promptContainer}>
          <h2 style={styles.promptHeader}>Select a #tag!</h2>
          <input 
            ref='promptInput'
            type='text' 
            style={styles.promptInput}
          />
          <button 
            ref='promptButton'
            style={styles.promptButton}>
            OK
          </button>
        </div>

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
  promptContainer: {
    display: 'none',
    width: 300,
    height: 200,
    position: 'absolute',
    background: 'gray',
    top: 145,
    zIndex: 2,
    borderRadius: 20,
    left: '16%',
    left: 'calc(50% - 150px)',
  },
  promptHeader: {
    position: 'relative',
    width: '100%',
    top: 25,
    color: 'white',
    textAlign: 'center',
    fontWeight: 100,
    margin: 0,
    fontSize: 36,
  },
  promptInput: {
    position: 'relative',
    width: 240,
    marginLeft: 20,
    height: 35,
    borderRadius: 20,
    border: 'none',
    outline: 'none',
    top: 45,
    padding: '0 10px',
    color: 'gray',
  },
  promptButton: {
    position: 'relative',
    width: '100%',
    height: 40,
    top: 75,
    zindex: 3,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    border: 'none',
    borderTop: '2px solid darkgray',
    outline: 'none',
    background: 'lightgray',
    bottom: 0,
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
