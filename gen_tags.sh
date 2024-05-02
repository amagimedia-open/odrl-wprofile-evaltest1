#!/bin/bash

set -u
set -x

# https://github.com/romainl/ctags-patterns-for-javascript

find . -name '*.js' -not -path './node_modules/*' |\
    grep -v '_modf.js' |\
    xargs ctags --options=NONE --options=./ctagssrc_js -f tags 



