exports.index = function(req, res) {
  res.json(req.model().index());
};
exports.get = function(req, res) {
  res.json(req.model().get(req.params.id));
};
exports.create = function(req, res) {
  res.json(req.model().create('post', req.body['post']));
};
