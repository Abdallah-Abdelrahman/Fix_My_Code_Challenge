const alt = require('../alt');
const request = require('superagent');
const config = require('../../config');

class AllPostActions {
  loadPage (pageNum, cb) {
    const AllPostStore = require('../stores/AllPostStore');
    const state = AllPostStore.getState();
    if (state.postsByPage[pageNum]) {
      this.actions.updatePsots(state.postsByPage[pageNum]);
    } else {
      const self = this;

      pageNum = pageNum - 1;

      const end = (pageNum * config.itemsPerPage) + config.itemsPerPage;
      const start = (pageNum * config.itemsPerPage);

      if (typeof NProgress !== 'undefined') {
        NProgress.start();
      }
      request.get(config.baseUrl + '/ajax/postsByPage/' + start + '/' + end, function (err, response) {
        self.actions.updatePosts(response.body, pageNum + 1);
        setTimeout(function () {
          if (typeof NProgress !== 'undefined') {
            NProgress.done();
          }
        }, 500);
        if (cb) {
          cb();
        }
      });
    }
  }

  loadPostListContent () {
    const self = this;

    const AllPostStore = require('../stores/AllPostStore');
    const state = AllPostStore.getState();
    if ((!!state.postListContent.content && state.postListContent.content != '') ||
            (!!state.postListContent.header && state.postListContent.header != '')) {
      return;
    }
    request.get(config.baseUrl + '/ajax/postListContent', function (err, response) {
      self.actions.updatePostListContent(response.body);
    });
  }

  getNumberOfPosts () {
    const self = this;

    const AllPostStore = require('../stores/AllPostStore');
    const state = AllPostStore.getState();
    if (state.numberOfPosts == 0) {
      request.get(config.baseUrl + '/ajax/getNumberOfPosts', function (err, response) {
        self.actions.update_NumberOfPosts(response.body.numberOfPosts);
      });
    } else {
      this.actions.update_NumberOfPosts(state.numberOfPosts);
    }
  }

  updateNumberOfPosts (num) {
    this.dispatch(num);
  }

  updatePosts (post, pageNum) {
    this.dispatch({
      post,
      pageNum
    });
  }

  updatePostListContent (postListContent) {
    this.dispatch(postListContent);
  }
}

module.exports = alt.createActions(AllPostActions);
