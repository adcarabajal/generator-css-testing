'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var chalk = require('chalk');


var CssTestingGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
  },

  askFor: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay('Welcome to the marvelous CssTesting generator!'));

    var prompts = [{
      name: 'name',
      message: 'Project name',
      default: path.basename(process.cwd())
    }, {
      name: 'description',
      message: 'Description',
      default: ''
    }, {
      name: 'serverPort',
      message: 'Local server port (use the default if you don\'t know what this means)',
      default: 8081
    }];

    this.prompt(prompts, function (props) {
      this.slugname = this._.slugify(props.name);
      this.props = props;

      done();
    }.bind(this));
  },

  app: function () {
    this.mkdir('less');

    this.template('less/bootstrap-custom.less', 'less/bootstrap-custom.less');

    this.copy('_package.json', 'package.json');
    this.copy('_bower.json', 'bower.json');
  },

  projectfiles: function () {
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
  },

  createDirectories: function () {
    this.mkdir('test');
    this.mkdir('test/html');
  },

  createGruntfile: function () {
    this.copy('Gruntfile.js');
  },

  createExample: function () {
    this.directory('test');
  }
});

module.exports = CssTestingGenerator;
