'use strict';

var _ = require('lodash');


function sauceEnvironment(capabilities, debug) {
  var browserNameNormalized = capabilities.browserName.replace(' ', '_');

  return {
    description: capabilities.browserName + ' VM at Sauce Labs',
    sauce: true,
    browserNameNormalized: browserNameNormalized,
    debug: debug,
    screenshotsPath: 'screenshots/sauce/' + browserNameNormalized,
    resultsPath: 'results/sauce/' + browserNameNormalized,
    remote: {
      host: "ondemand.saucelabs.com",
      port: 80
    },
    capabilities: _.assign({
      name: 'testing on ' + capabilities.browserName,
      'tunnel-identifier': 'tunnel-id',
      'screen-resolution': '1024x768',
      platform: 'Windows 7'
    }, capabilities)
  };
}


function localEnvironment(capabilities, debug) {
  var browserNameNormalized = capabilities.browserName.replace(' ', '_');

  return {
    description: capabilities.browserName + ' running locally',
    browserNameNormalized: browserNameNormalized,
    debug: debug,
    remote: 'http://localhost:9515',
    screenshotsPath: 'screenshots/local/' + browserNameNormalized,
    resultsPath: 'results/local/' + browserNameNormalized,
    capabilities: capabilities
  };
}


module.exports = function (targets, build) {
  build = build || 'no build info';

  var environments = {
    chrome: sauceEnvironment({
      browserName: 'chrome',
      version: '34',
      build: build
    }),
    firefox: sauceEnvironment({
      browserName: 'firefox',
      version: '29',
      build: build
    }),
    explorer: sauceEnvironment({
      browserName: 'internet explorer',
      version: '11',
      build: build
    }),
    local: localEnvironment({
      browserName: 'chrome'
    })
  };

  return (targets.length === 1 && targets[0] === 'all') ?
    environments : _.pick(environments, targets);
};
