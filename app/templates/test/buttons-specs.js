/* global describe, before, afterEach, after, it */
'use strict';

var
  Q = require('q'),
  _ = require('lodash'),
  assert = require('assert'),
  fs = require('fs'),
  glob = require('glob'),
  mkdirp = require('mkdirp'),
  path = require('path'),
  wd = require('wd'),
  SauceTunnel = require('sauce-tunnel'),
  chromeDriver = require('chromedriver'),

  targetEnvironments = process.env.TEST_ENVIRONMENTS ?
    process.env.TEST_ENVIRONMENTS.split(',') : ['local'],

  baseURL = process.env.TEST_BASE_URL || 'http://localhost:8081/',
  urls = glob.sync('html/**/*.html', {cwd: __dirname}).
    map(function (file) { return 'test/' + file; }),

  sauceUsername = process.env.SAUCE_USERNAME,
  sauceAccessKey = process.env.SAUCE_ACCESS_KEY,

  environments = require("./test-environments")(targetEnvironments, process.env.BUILD_TAG);

require('colors');

describe('Buttons Specs', function(){
  var
    tunnel,
    chromeDriverProcess;

  function startChromeDriverIfNeeded() {
    var chromeDriverDefer = Q.defer();

    if (_.any(environments, {sauce: undefined, browserNameNormalized: 'chrome'})) {
      chromeDriverProcess = chromeDriver.start();
      chromeDriverProcess.stdout.on('data', function () {
        chromeDriverDefer.resolve();
      });
    } else {
      chromeDriverDefer.resolve();
    }

    return chromeDriverDefer.promise;
  }

  function startSauceTunnelIfNeeded() {
    var sauceTunnelDefer = Q.defer();

    if(_.any(environments, 'sauce')) {
      startSauceTunnel(function () {
        sauceTunnelDefer.resolve();
      });
    } else {
      sauceTunnelDefer.resolve();
    }

    return sauceTunnelDefer.promise;
  }

  before(function(done){
    Q.all(
      [startChromeDriverIfNeeded(), startSauceTunnelIfNeeded()]
    ).nodeify(done);
  });

  after(function(done){
    if (chromeDriverProcess) {
      chromeDriverProcess.kill();
    }
    if (tunnel) {
      tunnel.stop(done);
    } else {
      done();
    }
  });

  function startSauceTunnel(done) {
    if(!sauceUsername || !sauceAccessKey){
      console.warn(
          '\nPlease configure your Sauce Labs credentials:\n\n' +
          'export SAUCE_USERNAME=<SAUCE_USERNAME>\n' +
          'export SAUCE_ACCESS_KEY=<SAUCE_ACCESS_KEY>\n\n'
      );
      throw new Error("Missing Sauce Labs credentials");
    }

    tunnel = new SauceTunnel(sauceUsername, sauceAccessKey, 'tunnel-id', true, ['--verbose']);
    tunnel.start(function (status) {
      if (status === false) {
        throw new Error('Something went wrong with the Sauce Labs tunnel');
      }
      done();
    });
  }

  _.each(environments, function (conf, envName) {
    describe('for ' + conf.description, function() {
      var
        allPassed = true,
        browser;

      before(function(done) {
        wd.configureHttp({
          timeout: 60000,
          retryDelay: 15000,
          retries: 5,
          baseUrl: baseURL
        });

        if (conf.sauce) {
          conf.remote = _.defaults(conf.remote, {
            username: sauceUsername,
            accessKey: sauceAccessKey
          });
        }
        browser = wd.promiseChainRemote(conf.remote);

        if (conf.debug) {
          browser.on('status', function(info) {
            console.log(info.cyan);
          });
          browser.on('command', function(eventType, command, response) {
            console.log(' > ' + eventType.cyan, command, (response || '').grey);
          });
          browser.on('http', function(meth, path, data) {
            console.log(' > ' + meth.magenta, path, (data || '').grey);
          });
        }

        browser.init(conf.capabilities).nodeify(done);
      });

      afterEach(function() {
        allPassed = allPassed && (this.currentTest.state === 'passed');
      });

      after(function(done) {
        browser.
          quit().
          then(function () {
            if (conf.sauce) {
              browser.sauceJobStatus(allPassed);
            }
          }).
          nodeify(done);
      });

      var pageName ='buttons';
      var url = 'http://localhost:8081/test/html/buttons.html';

      it("checking buttons styles", function(done) {
        if (fs.existsSync(path.resolve(__dirname, conf.screenshotsPath, pageName + '.png'))) {
          compareScreenshots(url, pageName).nodeify(done);
        } else {
          saveScreenshot(url, pageName).nodeify(done);
        }
      });

      function compareScreenshots(url, pageName) {
        var
          resultImage = conf.resultsPath + '/' + pageName + '.png',
          resultImageFileName = path.resolve(__dirname, resultImage),
          previousImage = conf.screenshotsPath + '/' + pageName + '.png',
          diffImageFileName = path.resolve(__dirname, conf.resultsPath + '/' + pageName + '.diff.png');


        mkdirp(path.dirname(resultImageFileName));

        return browser.
          get(url).
          saveScreenshot(resultImageFileName).
          get('test/image-comparison.html').
          execute('compare("../test/' + previousImage + '","../test/' + resultImage + '")').
          waitForElementById('result', 30000).text().
          then(function (value) {
            if (value === '0.00') {
              return;
            }

            return browser.
              execute('return window.diffImageData').
              then(function (data) {
                var writeFile = Q.denodeify(fs.writeFile);
                return writeFile(diffImageFileName, data, 'base64');
              }).then(function () {
                assert(parseFloat(value) <= 0.3, 'Mismatch of ' + value + ' found for ' +  pageName);
              });
          });
      }

      function saveScreenshot(url, pageName) {
        var fileName = path.resolve(__dirname, conf.screenshotsPath, pageName + '.png');
        mkdirp(path.dirname(fileName));

        return browser.
          get(url).
          saveScreenshot(fileName);
      }
    });
  });

});