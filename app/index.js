'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var fs = require('fs');
var win32 = process.platform === 'win32';

var MarklogicGenerator = module.exports = function MarklogicGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);

  this.argument('appname', { type: String, required: true });
  this.appname = this.appname || path.basename(process.cwd());

  args = ['main', this.appname];

  this.sourceRoot(path.join(__dirname, '..', 'templates'));
  this.destinationRoot(path.join('.', this.appname));

  this.indexFile = this.engine(this.read(path.join(this.sourceRoot(), '_index.html')), this);

  this.hookFor('marklogic:controller', {
    args: args
  });

  this.on('end', function () {
    // var dir = path.resolve('..');
    // process.chdir(dir);
    this.installDependencies({
      skipInstall: options['skip-install']
    });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '..', 'package.json')));
};

util.inherits(MarklogicGenerator, yeoman.generators.Base);

MarklogicGenerator.prototype.dirTree = function app() {
  this.mkdir('ui/app');
  this.mkdir('ui/app/fonts');
  this.mkdir('ui/app/images');
  this.mkdir('ui/app/styles/less');
  this.mkdir('ui/app/scripts');
  this.mkdir('ui/test');
  this.mkdir('ui/test/spec');
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

MarklogicGenerator.prototype.gitignore = function gitignore() {
  this.template('gitignore', '.gitignore');
};

MarklogicGenerator.prototype.test = function test() {
  this.directory('test', 'ui/test', true);
  this.copy('_karma.conf.js', 'karma.conf.js');
  this.copy('_karma-e2e.conf.js', 'karma-e2e.conf.js');
};

MarklogicGenerator.prototype.styles = function styles() {
  var files = ['main.less'];

  files.forEach(function (file) {
    this.copy('styles/' + file, 'ui/app/styles/less/' + file);
  }.bind(this));

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'css',
    optimizedPath: 'styles/main.css',
    sourceFileList: files.map(function (file) {
      return 'styles/' + file.replace('.less', '.css');
    }),
    searchPath: ['.tmp', 'app']
  });
};

MarklogicGenerator.prototype.js = function js() {
  var jsPlugins = [];

  jsPlugins.push('bower_components/jquery/dist/jquery.js');
  jsPlugins.push('bower_components/angular/angular.js');
  jsPlugins.push('bower_components/bootstrap/dist/js/bootstrap.js');
  jsPlugins.push('bower_components/angular-resource/angular-resource.js');
  jsPlugins.push('bower_components/angular-cookies/angular-cookies.js');
  jsPlugins.push('bower_components/angular-sanitize/angular-sanitize.js');
  jsPlugins.push('bower_components/angular-route/angular-route.js');
  jsPlugins.push('bower_components/angular-bootstrap/ui-bootstrap-tpls.js');

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/plugins.js',
    sourceFileList: jsPlugins
  });


  var jsFiles = ['scripts/app.js', 'scripts/controllers/main.js'];
  this.template('scripts/app.js', 'ui/app/scripts/app.js');

  this.indexFile = this.appendFiles({
    html: this.indexFile,
    fileType: 'js',
    optimizedPath: 'scripts/scripts.js',
    sourceFileList: jsFiles
  });
};

MarklogicGenerator.prototype.views = function views() {
  this.directory('views', 'ui/app/views', true);
};

MarklogicGenerator.prototype.all = function all() {
  this.write('ui/app/index.html', this.indexFile);
};

MarklogicGenerator.prototype.roxy = function roxy() {
  var spawnCommand = this.spawnCommand;
  var appname = this.appname;
  var dis = this;

  var cache = path.join(this.cacheRoot(), 'generator-marklogic', 'ml' + (win32 ? '.bat' : ''));
  this.fetch('https://github.com/marklogic/roxy/raw/dev/ml' + (win32 ? '.bat' : ''), cache, function(err) {
    if (err) {
      console.log(err);
    }
    else {
      fs.chmod(cache, '755', function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log ("chmod done");
        }
      });

      var dir = path.resolve('..');
      process.chdir(dir);
      var spawn = spawnCommand(cache, ['new', appname, '--server-version=7', '--app-type=rest', '--branch=dev', '--force']);
      spawn.on('close', function(code) {
        var build_props_file = path.join(dir, appname, 'deploy', 'build.properties');
        var build_props = dis.readFileAsString(build_props_file);
        build_props += "\nload-html-as-xml=false";
        // console.log("blah:" + build_props);
        dis.writeFileFromString(build_props, build_props_file);

        // dir = path.join(dir, 'ui');
        // process.chdir(dir);
      });
      // process.chdir(path.join(dir, appname));

    }
  });
};
