import util from 'util';
import {LogProcessor} from './logProcessor';


export const PrettyLog = function () {
  LogProcessor.call(this);
};
util.inherits(PrettyLog, LogProcessor);


PrettyLog.prototype._print = function (timestamp, line) {
  const trimmed = line.trim();
  if (trimmed.length < 1) {
    return;
  }
  const ts = timestamp.toLocaleString('en-AU', {hour12: false});
  const aligned = trimmed.split('\n')
    .map(l => (l.substr(0, 2) === '  ' ? l : `  ${l}`)).join('\n');

  this.push(`\n${ts}\n${aligned}\n`);
};


PrettyLog.prototype._parse = function (line) {
  let parsed = null;
  try {
    parsed = JSON.parse(line);
  } catch (error) {
    this.push(`${line}\n`);
  }
  return parsed;
};


PrettyLog.prototype._enrich = function (obj) {
  let timestamp = new Date();
  const printableObj = Object.keys(obj)
    .filter(key => ['errors', 'timestamp', 'app', 'version', 'datadog'].indexOf(key) === -1)
    .reduce((memo, key) => Object.assign(memo, {[key]: obj[key]}), {});

  if (obj.errors) {
    printableObj.errors = JSON.parse(obj.errors).map(err => {
      const stack = err.stack.split('\n');
      stack.shift();
      return Object.assign({}, err, {stack});
    });
  }
  if (obj.stack) {
    printableObj.stack = obj.stack.split('\n');
    printableObj.stack.shift();
  }
  if (obj.timestamp) {
    timestamp = new Date(obj.timestamp);
  }

  const line = util.inspect(printableObj, {colors: true, depth: null})
    .replace(/^\{/, '')
    .trim()
    .replace(/,\n/ig, '\n')
    .replace(/ \[ /ig, '   ')
    .replace(/ \{ /ig, '   ')
    .replace(/ \] /ig, '   ')
    .replace(/ \} /ig, '   ')
    .replace(/\s*\}$/, '  ')
    .trim();

  this._print(timestamp, line);
};


PrettyLog.prototype._processLines = function (lines, next) {
  lines
    .map(line => this._parse(line))
    .filter(obj => obj !== null)
    .forEach(obj => this._enrich(obj));

  next();
};
