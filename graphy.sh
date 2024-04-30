#!/bin/bash

GRAPHY_JS="node_modules/graphy/cli.js"

if [[ ! -f $GRAPHY_JS ]]
then
    echo "$GRAPHY_JS not present" >&2
    echo "install using 'npm install graphy'" >&2
    exit 1
fi

node $GRAPHY_JS "$@"
