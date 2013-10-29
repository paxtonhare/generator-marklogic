'use strict';
var path = require('path');
var util = require('util');
var yeoman = require('yeoman-generator');

module.exports = ControllerGenerator;

function ControllerGenerator() {
  yeoman.generators.NamedBase.apply(this, arguments);

  this.argument('appname', { type: String, required: true });

	this.sourceRoot(path.join(__dirname, '../templates'));
  // if the controller name is suffixed with ctrl, remove the suffix
  // if the controller name is just "ctrl," don't append/remove "ctrl"
  if (this.name && this.name.toLowerCase() !== 'ctrl' && this.name.substr(-4).toLowerCase() === 'ctrl') {
    this.name = this.name.slice(0, -4);
  }
}

util.inherits(ControllerGenerator, yeoman.generators.NamedBase);

ControllerGenerator.prototype.createControllerFiles = function createControllerFiles() {
	this.template('scripts/controller.js', 'ui/app/scripts/controllers/' + this.name + '.js');
	this.template('scripts/spec/controller.js', 'ui/test/spec/controllers/' + this.name + '.js');
};
