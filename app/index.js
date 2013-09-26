'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs.extra');

var MarklogicGenerator = module.exports = function MarklogicGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.argument('appname', { type: String, required: true });
  this.appname = this.appname || path.basename(process.cwd());

  args = ['main'];

  this.sourceRoot(path.join(__dirname, '..', 'templates'));
  this.destinationRoot(path.join('.', this.appname, "ui"));

  this.indexFile = this.engine(this.read(path.join(this.sourceRoot(), '_index.html')), this);

  this.hookFor('marklogic:controller', {
    args: args
  });

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '..', 'package.json')));
};

util.inherits(MarklogicGenerator, yeoman.generators.Base);

MarklogicGenerator.prototype.dirTree = function app() {
  this.mkdir('app');
  this.mkdir('app/fonts');
  this.mkdir('app/styles');
  this.mkdir('app/scripts');
  this.mkdir('test');
  this.mkdir('test/spec');
};

MarklogicGenerator.prototype.packageFile = function packageFile() {
  this.copy('_package.json', 'package.json');
};

MarklogicGenerator.prototype.bower = function bower() {
  this.template('_bower.json', 'bower.json');
  this.copy('bowerrc', '.bowerrc');
};

MarklogicGenerator.prototype.projectfiles = function projectfiles() {
  this.copy('editorconfig', '.editorconfig');
  this.copy('jshintrc', '.jshintrc');
};

MarklogicGenerator.prototype.gruntfile = function gruntfile() {
  this.template('_Gruntfile.js', 'Gruntfile.js');
};

MarklogicGenerator.prototype.test = function test() {
  this.directory('test', 'test', true);
  this.copy('_karma.conf.js', 'karma.conf.js');
  this.copy('_karma-e2e.conf.js', 'karma-e2e.conf.js');
};

MarklogicGenerator.prototype.styles = function styles() {
  var files = ['main.less'];

  files.forEach(function (file) {
    this.copy('styles/' + file, 'app/styles/' + file);
  }.bind(this));

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'css',
    optimizedPath: 'styles/main.css',
    sourceFileList: files.map(function (file) {
      return 'styles/' + file.replace('.less', '.css');
    }),
    searchPath: '.tmp'
  });
};

MarklogicGenerator.prototype.js = function js() {
  var jsPlugins = [];
  jsPlugins.push('bower_components/jquery/jquery.js');
  jsPlugins.push('bower_components/angular/angular.js');
  jsPlugins.push('bower_components/angular-route/angular-route.js');

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/plugins.js',
    sourceFileList: jsPlugins
  });


  var jsFiles = ['scripts/app.js', 'scripts/controllers/main.js'];
  this.template('scripts/app.js', 'app/scripts/app.js');

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/scripts.js',
    sourceFileList: jsFiles
  });
};

MarklogicGenerator.prototype.views = function views() {
  this.directory('views', 'app/views', true);
};

MarklogicGenerator.prototype.all = function all() {
  this.write('app/index.html', this.indexFile);
};

MarklogicGenerator.prototype.roxy = function roxy() {
  var spawnCommand = this.spawnCommand;
  var appname = this.appname;
  var dis = this;
  this.tarball('http://github.com/marklogic/roxy/archive/roxy2.tar.gz', '..', function(err){
    if (err) {
      console.log(err);
    }
    else {
      var dir = path.resolve('..');
      process.chdir(dir);
      spawnCommand('./ml', ['init', appname, '--server-version=7', '--app-type=rest']);

      var rmdir = path.resolve(path.join(dir, 'src'));
      fs.rmrf(rmdir, function(err) {
        if (err) {
          console.log(err)
        }
        else {
          fs.mkdir(rmdir, function(err) {
            if (err) {
              console.log(err);
            }
          });
        }
      });

      dir = path.join(dir, 'ui');
      process.chdir(dir);
    }
  });
};
