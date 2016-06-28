'use strict';


const Transform = require('stream').Transform;
const util = require('util');
const nlRegex = /\r?\n/i;

export const LogProcessor = function () {
  if (!(this instanceof LogProcessor)) {
    return new LogProcessor();
  }

  if (typeof this._processLines !== 'function') {
    throw new Error('_processLines must be implemented');
  }

  // automatically decode to utf8 and do not use Buffers
  Transform.call(this, {encoding: 'utf8', decodeStrings: false});

  this._buffer = '';
  return this;
};

util.inherits(LogProcessor, Transform);

LogProcessor.prototype._processLines = function (lines, next) {
  lines.forEach(line => this.push(line));
  next();
};


LogProcessor.prototype._transform = function (chunk, encoding, next) {
  // split on newlines
  const lines = (this._buffer + chunk).split(nlRegex);

  // keep the last partial line buffered
  this._buffer = lines.slice(-1)[0] || '';

  // process all lines except the last one
  const completeLines = lines.slice(0, -1);
  if (completeLines.length > 0) {
    this._processLines(completeLines, next);
  } else {
    next();
  }
};


LogProcessor.prototype._flush = function (next) {
  // Just handle any leftover
  this._processLines([this._buffer], next);
};
