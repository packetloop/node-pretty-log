#!/usr/bin/env node

import {PrettyLog} from './prettyLog';

process.stdin.pipe(new PrettyLog()).pipe(process.stdout);
