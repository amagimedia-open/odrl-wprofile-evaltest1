#!/bin/bash

JSONLD_JS="node_modules/jsonld-cli/bin/jsonld.js"

if [[ ! -f $JSONLD_JS ]]
then
    echo "$JSONLD_JS not present" >&2
    echo "install using 'npm install jsonld-cli'" >&2
    exit 1
fi

node $JSONLD_JS "$@"
