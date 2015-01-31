var app = require('express')();
var Ovenware = require('..');

describe('Ovenware Testing', function(){
  describe('Ovenware(app, {root: "./examples/simple/lib"})', function() {
    var ovenware = Ovenware(app, {root: './examples/simple/lib'});
    it('should be set with new root path "./examples/simple/lib"', function() {
      ovenware.conf.root.should.eql("./examples/simple/lib");
    });
    it('should get items model of ovenware.models', function() {
      ovenware.models.items.should.be.an.Object;
    });
    it('should load all models', function() {
      ovenware.models.should.have.properties(['users/oauth', 'items', 'categories']);
    });
  });
  describe('#setting()', function() {
    it('should return an object, no matter what type param you put', function() {
      Ovenware(app, null).conf.should.be.an.Object;
      Ovenware(app, '').conf.should.be.an.Object;
      Ovenware(app, undefined).conf.should.be.an.Object;
      Ovenware(app, false).conf.should.be.an.Object;
      Ovenware(app, function(){}).conf.should.be.an.Object;    
    });
    it('should always have properties ["root", "ctrl", "model", "routes", "aliases"]', function() {
      Ovenware(app, null).conf.should.have.properties(["root", "ctrl", "model", "routes", "aliases"]);
    });
    it('should get correct format and other defaultSetting', function() {
      Ovenware(app, {root: 'a', ctrl: 'b', model: 'c'}).conf.should.have.properties({
        root: 'a',
        ctrl: 'b',
        model: 'c',
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
        },
        aliases: {
          index: ''
        },
        prefix: '/'
      });
    });
  });
  describe('#load()', function() {
    it('should load dirpath which is not exist with no err and return an object {}', function() {
      Ovenware(app, {root: 'a', ctrl: 'b'}).ctrls.should.eql({}, 'need {}');
    });
    it('should load files in sub dirs', function() {
      Ovenware(app, {root: './examples/simple/lib'}).ctrls.should.have.properties(['index', 'items', 'users/oauth', 'users/info/mail']);
    });
  });
});
