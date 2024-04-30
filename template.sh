#!/bin/bash

set -u
#set -x

#----[globals]------------------------------------------------------------------------

DIRNAME=$(readlink -e $(dirname $0))
MODNAME=$(basename $0)

#----[sources]---------------------------------------------------------------

source $METASCH_SCRIPTS_FOLDER/common_bash_functions.sh

#----[options]---------------------------------------------------------------

#----[temp files and termination]--------------------------------------------

function fnxOnEnd
{
    rm $TMP1 $TMP2 
}

TMP1=`mktemp`
TMP2=`mktemp`

trap 'fnxOnEnd;' 0 1 2 3 6 9 11

#----[helper functions]------------------------------------------------------

#----------------------------------------------------------------------------
# MAIN
#----------------------------------------------------------------------------

if [[ $# -eq 0 ]]
then
    NQUADS_FILEPATH="$TMP1"
    cat > $NQUADS_FILEPATH
else
    NQUADS_FILEPATH="$1"
fi

rdfpipe -i nquads -o turtle $NQUADS_FILEPATH
if [[ $? -ne 0 ]]
then
    error_message "conversion to turtle format failed"
    exit 2
fi

exit 0

