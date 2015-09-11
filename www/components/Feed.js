/** @jsx React.DOM */

var React = require('react');

var Utils = require('../utils');

var Header     = require('./Header')
var FeedImage  = require('./FeedImage');

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
      pageHeight: (156 * 20 / 2),
      imgCount: 0,
      curPage: 0,
      interval: null,
      feedType: 'recent',
      lastFeedType: 'recent',
      pageLimit: 100,
      pageLimitBuffer: 10,
      pageDeletionCount: 0,
      autoScrollDuration: 3000,
      lastScroll: null,
      idolDetectionSecs: 60 * 5,
    };
  },
  componentDidMount: function() {
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
      }, this.props.autoScrollDuration, function() {
        this.props.scrolling = false;
      }.bind(this));
    }
  },
  componentWillUnmount: function() {
    clearInterval(this.props.interval);
    if (this.props.feedType === 'recent') this._storeFeed();
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
    this.state.images = [];
    var json = JSON.parse(localStorage.getItem('recent:'      + window.tag));
    var meta = JSON.parse(localStorage.getItem('recent-meta:' + window.tag));

    if (json) {
      this.props.imgCount          = 0;
      this.props.pageDeletionCount = 0

      json.forEach(function(img) {
        this._pushFeedImage({
          src: img.src,
          printURL: img.printURL,
          imgCount: ++this.props.imgCount,
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
  restartImageFetcher: function() {
    console.log('restarting!@!!')
    clearInterval(this.props.interval);
    this._storeFeed();
    // this.props.pageDeletionCount = 0;
    this.startImageFetcher();
  },
  getImages: function() {
    if (this.props.feedType !== 'recent') {      
      this.props.feedType = 'recent';
      this.startImageFetcher();
    }

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

          var pageCount        = Math.ceil(this.props.imgCount / this.props.pageSize);
          var visiblePageCount = pageCount - this.props.pageDeletionCount;
          var pageDiffCount    = visiblePageCount - this.props.pageLimit;        

          console.log('pagecount: ' + pageCount, 'pageDeletionCount: ' + this.props.pageDeletionCount, 'pageLimit: ' + this.props.pageLimit);
          if (pageDiffCount > 0) {
              this.state.images.splice(0, this.props.pageSize * this.props.pageLimitBuffer);
              this.props.pageDeletionCount += this.props.pageLimitBuffer;
          }

          this.setState({ images: this.state.images });

          if ((new Date().getTime() / 1000) > this.props.lastScroll + this.props.idolDetectionSecs)
            this.scrollToBottom();
        }
      }.bind(this)
    );
  },
  getUserImages: function(id) {
    clearInterval(this.props.interval);

    // store images
    if (this.props.feedType !== 'search') {
      this.props.feedType = 'search';
      this._storeFeed();
      $(this.refs.feedContainer.getDOMNode()).scrollTop(0);
    } 
    
    // reset feed state
    this.state.images   = [];
    this.props.imgCount = 0;
    this.props.curPage  = 0;

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
        }
      }.bind(this)
    );
  },
  addScrollListener: function() {
    var $feedContainer = $(this.refs.feedContainer.getDOMNode());
    var $scrollButton  = $(this.refs.scrollButton.getDOMNode());
    var curScrollTop   = 0; window.restart = this.restartImageFetcher;

    $feedContainer.scroll(function() {
      var prevScrollTop     = curScrollTop;
      var scrollHeight      = $feedContainer[0].scrollHeight;
      this.props.lastScroll = new Date().getTime() / 1000;

      // prevent scroll to removed images
      var spacerHeight = this.props.pageHeight * this.props.pageDeletionCount;
      if ($feedContainer.scrollTop() < spacerHeight) {
        console.log("PREVENT SCROLL")
        $feedContainer.scrollTop(spacerHeight);
        this.props.pageDeletionCount = 0;
        this.restartImageFetcher();
        return;
      }

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

      var curPage = Math.max(Math.ceil(($feedContainer.scrollTop() / this.props.pageHeight)), 1);

      // paginate (hide/show)
      if (curPage !== this.props.curPage || this.props.feedType !== this.props.lastFeedType) {
        this.props.lastFeedType = this.props.feedType;

        setTimeout(function() {
          this.props.curPage = curPage;
          var totalPages     = Math.max(Math.ceil(this.props.imgCount / this.props.pageSize), 1);
          console.log('CURPAGE: ' + curPage);
          for (var i = this.props.pageDeletionCount + 1; i <= totalPages; i++) {
            var $page = $('.feed-image[data-page='+i+']');

            if ([curPage - 2, curPage - 1, curPage, curPage + 1].indexOf(i) !== -1) {
              $page.each(function(i, el) {
                var src = $(el).attr('data-src');
                $(el).attr('src', src).css('visibility', 'visible');
              });
            } else {
              $page.attr('src', '/img/dummy-img.png').css('visibility', 'hidden');
            }
          } 
        }.bind(this), 200);
        
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
  enqueueImage: function(imgData) {
    if (!Utils.objInArr(imgData, window.printQueue)) {
      window.printQueue.push(imgData)
      this.setState({ printQueue: window.printQueue });
    }
  },
  dequeueImage: function(i) {
    window.printQueue.splice(i, 1);
    this.setState({ printQueue: window.printQueue });
  },
  _pushFeedImage: function(props) {
    this.state.images.push(
      <FeedImage 
        src={props.src}
        printURL={props.printURL}
        page={Math.ceil(props.imgCount / this.props.pageSize)}
        enqueueImage={this.enqueueImage}
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
  pause: function() {
clearInterval(this.props.interval); //<button style={{position: 'absolute', top: 100}} onClick={this.pause}>Hault</button>
  },
  render: function() {
    var printQueueImgs = window.printQueue.map(function(img, i) {
      return (
        <div
          style={styles.printImgContainer}
          onClick={this.dequeueImage.bind(this, i)}>
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
          left            = 'settings' 
          middle          = 'search' 
          right           = 'print'
          getUserImages   = {this.getUserImages}
          getRecentImages = {this.getImages}
          dequeueImage    = {this.dequeueImage}
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

          <div 
            style={Utils.merge(styles.spacer, { height: this.props.pageHeight * this.props.pageDeletionCount })}
            ref='spacer'>
          </div>
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
  spacer: {
    width: '100%',
    height: 0,
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
