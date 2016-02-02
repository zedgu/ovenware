var fs = require('fs');
var path = require('path');

module.exports = function(root, part, extname) {
  var files = pathParser(path.join(root, '/', part), extname);
  var obj = {};

  for (var file in files) {
    obj[file.toLowerCase().replace(/\\/g, '/')] = require(files[file]);
  }

  return obj;
};

/**
 * to parse the paths of files
 * @param  {String} root    root path
 * @param  {String} subPath sub dir path
 * @param  {Object} paths   dictionary of the paths
 * @return {Object}         dictionary of the paths
 * @api private
 */
function pathParser(root, extname, subPath, paths) {
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
      if (~extname.split('|').indexOf(path.extname(file).substr(1))) {
        var rootPath = '^' + path.join(path.resolve(root), '/');
        rootPath = rootPath.replace(/\\/g, '\\\\') + '(.*)\.(' + extname + ')$';
        paths[file.match(new RegExp(rootPath))[1].toLowerCase()] = file;
      }
    } else if (fs.statSync(file).isDirectory()) {
      pathParser(root, extname, file, paths);
    }
  });
  return paths;
}
