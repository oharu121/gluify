/**
 * gluify - A type-safe pipeline library for TypeScript that glues functions from different libraries together
 *
 * @license MIT
 */

'use strict';

module.exports = require('./dist/Gluify');
module.exports.default = require('./dist/Gluify').default;
module.exports.gluify = require('./dist/Gluify').gluify;
module.exports.Gluify = require('./dist/Gluify').Gluify;
module.exports.PipeFunction = require('./dist/Gluify').PipeFunction;
