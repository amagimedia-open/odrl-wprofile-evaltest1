#!/bin/bash

set -u
#set -x

#----[globals]------------------------------------------------------------------------

DIRNAME=$(readlink -e $(dirname $0))
MODNAME=$(basename $0)

#----[sources]---------------------------------------------------------------

#----[options]---------------------------------------------------------------

#----[temp files and termination]--------------------------------------------

function fnxOnEnd
{
    :
    #rm $TMP1 $TMP2 
}

#TMP1=`mktemp`
#TMP2=`mktemp`

trap 'fnxOnEnd;' 0 1 2 3 6 9 11

#----[helper functions]------------------------------------------------------

#----------------------------------------------------------------------------
# MAIN
#----------------------------------------------------------------------------

cat | $DIRNAME/jsonld.sh format -f n-quads | rdfpipe -i nquads -o ttl -

#TODO: use graphy instead of rdfpipe
