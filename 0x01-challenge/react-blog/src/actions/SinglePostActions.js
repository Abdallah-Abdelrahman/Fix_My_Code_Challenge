const alt = require('../alt');
const request = require('superagent');
const config = require('../../config');
const IncludeHandler = require('../IncludeHandler');

class SinglePostActions {
  loadSinglePost (id, cb) {
    const self = this;

    const SinglePostStore = require('../stores/SinglePostStore');
    const state = SinglePostStore.getState();
    if (state.stateById[id]) {
      this.actions.updateCurrentPost(state.stateById[id].post);
      this.actions.updateIncludes(state.stateById[id].includes);
      if (cb) {
        cb();
      }
    } else {
      if (typeof window !== 'undefined' && typeof window.NProgress !== 'undefined') {
        NProgress.start();
      }

      request.get(config.baseUrl + '/ajax/post/' + id, function (err, response) {
        const post = response.body;
        const includes = post.includes || []; const loadedIncludes = [];
        let includeNum = includes.length;

        const finish = function () {
          self.actions.updateCurrentPost(post);
          self.actions.updateIncludes(loadedIncludes);
          setTimeout(function () {
            if (typeof NProgress !== 'undefined') {
              NProgress.done();
            }
          }, 500);
          if (cb) {
            cb();
          }
        };

        if (includeNum > 0) {
          const includeCallback = function (type, data, path) {
            loadedIncludes.push({
              type,
              value: data,
              path
            });

            includeNum--;
            if (includeNum == 0) {
              finish();
            }
          };

          let type, path;
          for (let i = 0; i < includes.length; i++) {
            type = includes[i].type;
            path = includes[i].path;
            IncludeHandler.handleInclude(type, path, includeCallback);
          }
        } else {
          finish();
        }
      });
    }
  }

  updateCurrentPost (post) {
    this.dispatch(post);
  }

  updateIncludes (includes) {
    this.dispatch(includes);
  }

  reset () {
    this.dispatch();
  }
}

module.exports = alt.createActions(SinglePostActions);
