/** @jsx React.DOM */

var React = require('react');

var Utils = require('../utils');

var Header    = require('./Header')
var FeedImage = require('./FeedImage');

var Feed = React.createClass({
  getInitialState: function() {
    return {
      images: [],
      printQueue: window.printQueue,
    };
  },
  getDefaultProps: function() {
    return {
      maxTagId: null,
      atBottom: true,
      pageSize: 20,
      pageHeight: (155 * 20 / 2),
      imgCount: 0,
      curPage: 0,
      interval: null,
      type: 'recent',
    };
  },
  componentDidMount: function() {
    window.objInArr = Utils.objInArr;
    window.objEqual = Utils.objEqual;
    if (!window.tag) {
      $(this.refs.promptContainer.getDOMNode()).fadeIn(300, function() {
        this.addPromptHandlers();
        $(this.refs.promptInput.getDOMNode()).val('#').focus();
      }.bind(this));
    } else {
      this.initFeed(); 
    }
  },
  componentWillUpdate: function() {
    var $feedContainer  = $(this.refs.feedContainer.getDOMNode());

    this.props.atBottom = (($feedContainer[0].scrollHeight === $feedContainer.innerHeight()) || 
                          ($feedContainer.scrollTop() + $feedContainer.innerHeight()) >= $feedContainer[0].scrollHeight);
  },
  componentDidUpdate: function() {
    if (this.props.atBottom && !this.props.scrolling) {
      var $feedContainer = $(this.refs.feedContainer.getDOMNode());

      this.props.scrolling = true;
      $feedContainer.animate({
        scrollTop: $feedContainer[0].scrollHeight
      }, 3000, function() {
        this.props.scrolling = false;
      }.bind(this));
    }
  },
  componentWillUnmount: function() {
    clearInterval(this.props.interval);
    if (this.props.type === 'recent') this._storeFeed();
  },
  initFeed: function() {
    this.startImageFetcher();
    this.addScrollListener();  
  },
  addPromptHandlers: function() {
    $(this.refs.promptButton.getDOMNode()).click(function(e) {
      e.preventDefault();
      e.stopPropagation();

      var value = $(this.refs.promptInput.getDOMNode()).val().trim().replace('#', '');
      if (value) {
        $(this.refs.promptContainer.getDOMNode()).fadeOut(500);
        window.tag = value;
        this.initFeed();  
      } else {
        alert('You must choose a #tag to start the feed', null, 'Wait a Sec!', 'Got it!');
        $(this.refs.promptInput.getDOMNode()).focus();
      }
    }.bind(this));
  },
  focusPromptInput: function() {
    $(this.refs.promptInput.getDOMNode()).focus();
  },
  startImageFetcher: function() {
    var json = JSON.parse(localStorage.getItem('recent:'      + window.tag));
    var meta = JSON.parse(localStorage.getItem('recent-meta:' + window.tag));

    if (json) {
      this.props.imgCount = 0;
      json.forEach(function(img) {
        this._pushFeedImage({
          src: img.src,
          printURL: img.printURL,
          imgCount: ++this.props.imgCount,
          selected: Utils.objInArr({
            src: img.src,
            printURL: img.printURL, 
          }, window.printQueue),
        });
      }.bind(this));

      this.setState({ images: this.state.images });

      this.props.scrolling = true;
      setTimeout(function() {
        $(this.refs.feedContainer.getDOMNode()).scrollTop(meta.scrollTop + 1);
        this.props.scrolling = false;

      }.bind(this), 200);

      localStorage.removeItem('recent:'      + window.tag);
      localStorage.removeItem('recent-meta:' + window.tag);
    }

    this.getImages();
    this.props.interval = setInterval(function() {
      this.getImages();
    }.bind(this), 10000); 
  },
  getImages: function() {
    this.props.type = 'recent';

    $.getJSON(
      'https://api.instagram.com/v1/tags/'+window.tag+'/media/recent?count=30&max_tag_id='+this.props.maxTagId+'&callback=?',
      {
        client_id: '90af4f5aec3f4c0caf32d2cf8ed0d257',
      },
      function(response, status) {
        if (status === 'error') {
          console.log('Failed to fetch Images');
        } else {
          this.props.maxTagId = response.pagination.next_max_tag_id;
          var ageLimit        = window.ageLimit ? window.ageLimit : 12;
          var time            = new Date().getTime() / 1000;

          response.data.forEach(function(img) {
            var age = (time - img.created_time) * 3600;
            if (age < ageLimit || img.type !== 'image') return;

            this._pushFeedImage({
              src: img.images.low_resolution.url,
              printURL: img.images.standard_resolution.url,
              imgCount: ++this.props.imgCount,
            });
          }.bind(this));

          this.setState({ images: this.state.images });
        }
      }.bind(this)
    );
  },
  getUserImages: function(id) {
    clearInterval(this.props.interval);

    // store images
    if (this.props.type === 'recent') this._storeFeed();
    
    // reset feed state
    this.state.images   = [];
    this.props.imgCount = 0;
    this.props.curPage  = 0;

    this.props.type = 'search';

    $.getJSON(
      'https://api.instagram.com/v1/users/'+id+'/media/recent/?count=30&callback=?',
      {
        client_id: '90af4f5aec3f4c0caf32d2cf8ed0d257',
      },
      function(response, status) {
        if (status === 'error') {
          console.log('Failed tofetch user\'s Images');
        } else {

          response.data.forEach(function(img) {
            if (img.type !== 'image') return;
            this._pushFeedImage({
              src: img.images.low_resolution.url,
              printURL: img.images.standard_resolution.url,
              imgCount: ++this.props.imgCount,
              selected: Utils.objInArr({
                src: img.images.low_resolution.url,
                printURL: img.images.standard_resolution.url, 
              }, window.printQueue),
            })
          }.bind(this));

          this.setState({ images: this.state.images })
          var $feedContainer = $(this.refs.feedContainer.getDOMNode());
          $feedContainer.scrollTop($feedContainer.scrollTop() + 1);
        }
      }.bind(this)
    );
  },
  addScrollListener: function() {
    var $feedContainer = $(this.refs.feedContainer.getDOMNode());
    var $scrollButton  = $(this.refs.scrollButton.getDOMNode ());
    var curScrollTop   = 0;

    $feedContainer.scroll(function() {
      var prevScrollTop = curScrollTop;
      var scrollHeight  = $feedContainer[0].scrollHeight;

      setTimeout(function() {
        curScrollTop = $feedContainer.scrollTop();
        // if user's scrolling && not at bottom
        if (((curScrollTop !== prevScrollTop) && curScrollTop + $feedContainer.innerHeight()) < scrollHeight &&
          this.props.scrolling === false) {
          $scrollButton.fadeIn(300);
        } else if ($scrollButton.is(':visible') && this.props.scrolling === false) {
          $scrollButton.fadeOut(300);
        } 
      }.bind(this), 200);

      var curPage = Math.ceil($feedContainer.scrollTop() / this.props.pageHeight);

      // paginate (hide/show)
      if (curPage === 0 || curPage !== this.props.curPage) {
        this.props.curPage = curPage;
        var totalPages     = Math.ceil(this.props.imgCount / this.props.pageSize);
      
        for (var i = 1; i <= totalPages; i++) {
          var $page = $('img[data-page='+i+']');

          if ([curPage - 1, curPage, curPage + 1].indexOf(i) !== -1) {
            $page.each(function(i, el) {
              var src = $(el).attr('data-src');
              $(el).attr('src', src).css('visibility', 'visible');
            });
          } else {            
            $page.attr('src', '/img/dummy-img.png').css('visibility', 'hidden');
          }
        } 
      }

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
  handlePrintQueue: function(imgData) {
    var selected = imgData.selected;
    delete imgData.selected;

    if (selected) {
      window.printQueue.push(imgData)
    } else {
      window.printQueue.forEach(function(data, i) {
        if (data.src === imgData.src) {
          window.printQueue.splice(i, 1);
        }
      }.bind(this));
    }
    this.setState({ printQueue: window.printQueue });
  },
  removePrintItem: function(i) {
    var dequeuedImgSrc = window.printQueue[i].src
    window.printQueue.splice(i, 1);
    $('img[data-src="'+dequeuedImgSrc+'"]').click();

    // Ensure click happens
    setTimeout(function() {
      if ($('img[data-src="'+dequeuedImgSrc+'"]').siblings('img').is(':visible'))
        $('img[data-src="'+dequeuedImgSrc+'"]').click();
    }, 200);
    this.setState({ printQueue: window.printQueue });
  },
  _pushFeedImage: function(props) {
    this.state.images.push(
      <FeedImage 
        src={props.src}
        printURL={props.printURL}
        page={Math.ceil(props.imgCount / this.props.pageSize)}
        selected={props.selected}
        handlePrintQueue={this.handlePrintQueue}
      />
    );
  },
  _storeFeed: function() {
    var serializedImages = this.state.images.map(function(component) {
      return component.props;
    });

    var meta = {
      maxTagId: this.props.maxTagId,
      scrollTop: $(this.refs.feedContainer.getDOMNode()).scrollTop(),
    }

    localStorage.setItem('recent:'      + window.tag, JSON.stringify(serializedImages));
    localStorage.setItem('recent-meta:' + window.tag, JSON.stringify(meta));
  },
  render: function() {
    var printQueueImgs = window.printQueue.map(function(img, i) {
      return (
        <div
          style={styles.printImgContainer}
          onClick={this.removePrintItem.bind(this, i)}>
          <div style={styles.xIconContainer}>
            <img 
              style={styles.xIcon}
              src='img/x-icon.png'
            />
          </div>
          <img 
            style={styles.printImg}
            src={img.src}
          />
        </div>
      );
    }.bind(this));

    return (
      <div className='page'>
        <Header 
          left          = 'settings' 
          middle        = 'search' 
          right         = 'print'
          getUserImages = {this.getUserImages}
        />

        <div 
         style={styles.printQueue}>
         {printQueueImgs}
        </div>

        <div 
          ref       = 'promptContainer'
          style     = {styles.promptContainer}
          onClick   = {this.focusPromptInput}>
          <h2 style = {styles.promptHeader}>Set a #tag!</h2>
          <input 
            ref   = 'promptInput'
            type  = 'text' 
            style = {styles.promptInput}
          />
          <button 
            ref   = 'promptButton'
            style = {styles.promptButton}>
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
            ref     = 'scrollButton'
            style   = {styles.scrollButton}
            onClick = {this.scrollToBottom}>
            Most Recent
            <div style = {styles.downArrow}></div>
          </div>
        </div>

      </div>
    );
  }
});

var styles = {
  printQueue: {
    position: 'absolute',
    top: 75,
    right: 0,
    width: 50,
    minHeight: 300,
    zIndex: 999,
  },
  printImgContainer: {
    position: 'relative',
  },
  printImg: {
    width: 42,
    height: 42,
    cursor: 'pointer',
    borderRadius: 20,
    marginTop: 5,
  },
  xIconContainer: {
    width: 20,
    height: 20,
    top: 3,
    right: 3,
    borderRadius: 10,
    position: 'absolute',
    background: 'rgba(128,128,128,0.7)',
    cursor: 'pointer',
  },
  xIcon: {
    width: 12,
    height: 12,
    position: 'relative',
    bottom: 2,
    left: 4,
  },
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
    borderRadius: 20,
    left: '16%',
    left: 'calc(50% - 150px)',
    zIndex: 2,
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
