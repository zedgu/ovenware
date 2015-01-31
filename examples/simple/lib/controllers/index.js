exports.index = function(req, res, next) {
  if (req.query.exports) {
    res.send(exports.ctrl() === exports.ctrl('index'));
  } else {
    res.send('Hello World!');
  }
  next();
};

exports.create = function(req, res) {
  res.send(req.ctrl() === exports);
};
