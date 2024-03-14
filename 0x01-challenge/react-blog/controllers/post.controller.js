
const request = require('superagent');
const config = require('../config');
const IncludeHandler = require('../src/IncludeHandler');

exports.showAllPosts = function (req, res, next) {
  console.log(req.params.pageNum);
  let pageNum = parseInt(req.params.pageNum || 1);
  pageNum -= 1;

  request.get(config.baseUrl + '/static/posts.json', function (err, response) {
    const itemsPerPage = config.itemsPerPage;
    res.locals.data = {
      AllPostStore: {
        postsByPage: {
        },
        numberOfPosts: response.body.posts.length,
        postListContent: response.body.postListContent
      }
    };

    res.locals.data.AllPostStore.postsByPage[pageNum + 1] = response.body.posts.slice(itemsPerPage * pageNum, (itemsPerPage * pageNum) + itemsPerPage);
    res.locals.metaDescription = response.body.postListContent.metaDescription || '';

    next();
  });
};

exports.loadPostsViaAjax = function (req, res) {
  request.get(config.baseUrl + '/static/posts.json', function (err, response) {
    res.json(response.body.posts);
  });
};

exports.showSinglePost = function (req, res, next) {
  const id = req.params.id;

  request.get(config.baseUrl + '/static/posts.json', function (err, response) {
    const posts = response.body.posts;

    let found = false;
    posts.forEach(function (post) {
      if (post.id === parseInt(id, 10)) {
        found = true;

        res.locals.data = {
          SinglePostStore: {
            currentPost: post,
            id: post.id,
            stateById: {}
          }
        };

        res.locals.metaDescription = post.metaDescription || post.title;

        res.locals.data.SinglePostStore.stateById[post.id] = {};
        res.locals.data.SinglePostStore.stateById[post.id].post = post;

        const includes = post.includes || [];
        let includeNum = includes.length;

        if (includeNum > 0) {
          res.locals.data.SinglePostStore.includes = [];
          const includeCallback = function (type, data, path) {
            res.locals.data.SinglePostStore.includes.push({
              type,
              value: data,
              path
            });

            includeNum--;
            if (includeNum == 0) {
              res.locals.data.SinglePostStore.stateById[post.id].includes = res.locals.data.SinglePostStore.includes;
              next();
            }
          };

          let type, path;
          for (let i = 0; i < includes.length; i++) {
            type = includes[i].type;
            path = includes[i].path;
            IncludeHandler.handleInclude(type, path, includeCallback);
          }
        } else {
          next();
        }
      }
    });

    if (!found) next();
  });
};

exports.loadSinglePostViaAjax = function (req, res) {
  const id = req.params.id;
  request.get(config.baseUrl + '/static/posts.json', function (err, response) {
    response.body.posts.forEach(function (post) {
      if (post.id === parseInt(id, 10)) {
        return res.json(post);
      }
    });
  });
};

exports.loadPostListContent = function (req, res) {
  request.get(config.baseUrl + '/static/posts.json', function (err, response) {
    res.json(response.body.postListContent);
  });
};

exports.loadPostsByPage = function (req, res) {
  const start = req.params.start;
  const end = req.params.end;
  request.get(config.baseUrl + '/static/posts.json', function (err, response) {
    res.json(response.body.posts.filter(function (post, index) {
      if (index >= start && index < end) {
        return true;
      }

      return false;
    }));
  });
};

exports.getNumberOfPosts = function (req, res) {
  request.get(config.baseUrl + '/static/posts.json', function (err, response) {
    res.json({
      numberOfPosts: response.body.posts.length
    });
  });
};
