#!/bin/sh
#
# Auto-format and lint all files
#
# Usage
#	./lint.sh
#

SCRIPT_DIR=`dirname "$0"`
WEBAPP_ROOT="${SCRIPT_DIR}/.."

PATH_CONFIG="${WEBAPP_ROOT}/config/"
PATH_MODELS="${WEBAPP_ROOT}/models/"
PATH_MODULES="${WEBAPP_ROOT}/modules/"
PATH_JS="${WEBAPP_ROOT}/public/js/"
PATH_ROUTES="${WEBAPP_ROOT}/routes/"

function_lint()
{
	cd $1
	for FILE in *.js; do
	    [ -f "${FILE}" ] || break
	    npx eslint ${FILE} # lint
	done
}

# loop through all directories
for DIR in ${PATH_MODULES} ${PATH_JS}; do
	function_lint "${DIR}"
done
