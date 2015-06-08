var path = require('path');
var util = require('util');
var methods = require('methods');
var debug = require('debug')('ovenware');
var load = require('./loader');

var defaultSetting = {
  root: './lib',
  ctrl: 'controllers',
  model: 'models',
  aliases: {
    'index': ''
  },
  routes: {
    'index': {
      method: 'get',
      path: ''
    },
    'create': {
      method: 'post',
      path: ''
    },
    'get': {
      method: 'get',
      path: '/:id'
    },
    'update': {
      method: 'put',
      path: '/:id'
    },
    'del': {
      method: 'delete',
      path: '/:id'
    }
  }
};

module.exports = Ovenware;

function Ovenware(app, options) {
  if (!(this instanceof Ovenware)) {
    return new Ovenware(app, options);    
  }

  this.app = app
  this.conf = setting(options);
  this.ctrls = load(this.conf.root, this.conf['ctrl']);
  this.models = load(this.conf.root, this.conf['model']);
  this.routes = {};

  this.middleware();
  this.regRoutes();
}

var ovenware = Ovenware.prototype;

/**
 * register all routes
 * @api private
 */
ovenware.regRoutes = function() {
  var ctrls = this.ctrls;
  var models = this.models;
  var conf = this.conf;

  ctrlFactory(ctrls, models, conf.aliases);

  for (var name in ctrls) {
    name = name.toLowerCase();
    var ctrl = ctrls[name];
    ctrl.routes = ctrl.routes || {};

    for (var handler in ctrl) {
      var route =  ctrl.routes[handler] || conf.routes[handler];
      if (route && route.method && ~methods.indexOf(route.method)) {
        if (!/\/$/.test(conf.prefix)) {
          conf.prefix += '/';
        }
        var routePath = conf.prefix + ctrl.ctrlName + route.path;
        if (conf._prefix_flags) {
          routePath = new RegExp(routePath, conf._prefix_flags);
        }

        this.route(route.method, name, routePath, ctrl[handler], handler);
      }
    }
  }
};

ovenware.route = function(method, name, path, handler, handlerName) {
  debug('Route Added:  %s %s - [%s] -> %s', method.toUpperCase(), path, name, handlerName);
  if (!this.routes[path]) {
    this.routes[path] = name;
  }
  this.app[method](path, this.preprocess(handler, path, name));
};

ovenware.preprocess = function(fn, path, name) {
  return fn;
};

ovenware.middleware = function() {
  var ow = this;

  function getObj(obj, req) {
    /**
     * get model/ctrl object via ctx
     * @param  {String} name model/ctrl name
     * @return {Object}      model/ctrl object
     */
    return function(name) {
      name = name || ow.routes[req.route.path];
      return ow[obj][name.toLowerCase()];
    };
  }
  this.app.use(function Ovenware(req, res, next) {
    req.ctrl = getObj('ctrls', req);
    req.model = getObj('models', req);
    next();
  });
};

function ctrlFactory(ctrls, models, aliases) {
  for (var file in ctrls) {
    var ctrl = ctrls[file];
    var basename = path.basename(file);
    var alias = typeof ctrl.alias === 'string' ? ctrl.alias : typeof aliases[basename] === 'string' ? aliases[basename] : basename;

    ctrl.ctrlName = file.replace(new RegExp(basename + '$'), alias).replace(/(?!^.+)\/$/, '');
    if (models[file]) {
      ctrl._model = models[file];
    }

    ctrl.model = function (modelName) {
      if (typeof modelName === 'string') {
        return models[modelName.toLowerCase()];
      } else {
        return this._model;
      }
    };
    ctrl.ctrl = function (ctrlName) {
      if (typeof ctrlName === 'string') {
        return ctrls[ctrlName.toLowerCase()];
      } else {
        return this;
      }
    };
  }
}

function setting(options) {
  var conf = {};

  if (options === null || typeof options !== 'object') {
    options = {};
  }

  for (var key in defaultSetting) {
    conf[key] = options[key] === undefined ? defaultSetting[key] : options[key];
  }

  var prefix = options.prefix;
  switch(true) {
    case typeof prefix === 'string':
      conf.prefix = prefix;
      break;
    case util.isRegExp(prefix):
      conf._prefix_flags = (prefix.ignoreCase ? 'i' : '') + (prefix.global ? 'g' : '');
      conf.prefix = /^\//.test(prefix.source) ? prefix.source : '/' + prefix.source;
      break;
    default:
      conf.prefix = '';
      break;
  }

  return conf;
}
