#!/usr/bin/env node
'use strict';

var _prettyLog = require('./prettyLog');

process.stdin.pipe(new _prettyLog.PrettyLog()).pipe(process.stdout);