var fs = require('fs');
var path = require('path');

module.exports = function(root, part) {
  var files = loadfiles(path.join(root, '/', part));
  var obj = {};

  for (var file in files) {
    obj[file.toLowerCase().replace(/\\/g, '/')] = require(files[file]);
  }

  return obj;
};

/**
 * to load files
 * @param  {String} root    root path
 * @param  {String} subPath sub dir path
 * @param  {Object} paths   dictionary of the paths
 * @return {Object}         dictionary of the paths
 * @api private
 */
function loadfiles(root, subPath, paths) {
  var dirPath = path.resolve(subPath || root);
  var files;
  paths = paths || {};

  try {
    files = fs.readdirSync(dirPath);
  } catch(e) {
    files = [];
  }
  files.forEach(function(file) {
    file = path.join(dirPath, '/', file);
    if (fs.statSync(file).isFile()) {
      if (path.extname(file) === '.js') {
        var filePath = '^' + path.join(path.resolve(root), '/');
        filePath = filePath.replace(/\\/g, '\\\\');
        paths[file.replace(new RegExp(filePath), '').replace(/.js$/, '').toLowerCase()] = file;
      }
    } else if (fs.statSync(file).isDirectory()) {
      loadfiles(root, file, paths);
    }
  });
  return paths;
}
