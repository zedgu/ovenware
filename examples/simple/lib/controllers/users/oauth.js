exports.alias = 'auth';
exports.routes = {
  entry: {
    method: 'get',
    path: '/index'
  },
  post: {
    method: 'post',
    path: '/'
  },
  get: {
    method: 'post',
    path: '/:id'
  }
}
exports.entry = function(req, res) {
  res.send('in sub dir');
};

exports.post = function(req, res) {
  res.send(exports.model().index());
};
exports.get = function(req, res) {
  res.send(exports.model('items').index());
}
