/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

import 'zone.js';  // Included with Angular CLI.

// karma.conf.js
module.exports = function (config: {
        set: (arg0: {
            basePath: string; frameworks: string[]; plugins: any[]; client: {
                jasmine: {}; clearContext: boolean; // leave Jasmine Spec Runner output visible in browser
            }; jasmineHtmlReporter: {
                suppressAll: boolean; // removes the duplicated traces
            }; coverageReporter: { dir: any; subdir: string; reporters: { type: string; }[]; }; reporters: string[]; browsers: string[]; restartOnFileChange: boolean;
        }) => void;
    }) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution order
        // random: false
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/qr-menu-frontend'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['Chrome'],
    restartOnFileChange: true
  });
};
