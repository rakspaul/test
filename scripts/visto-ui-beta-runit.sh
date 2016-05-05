#!/bin/bash
VISTO_UI_BETA_HOME="/home/amp/visto-ui-beta"
VISTO_UI_BETA_PID=${VISTO_UI_BETA_HOME}/visto-ui-beta.pid
echo $$ > $VISTO_UI_BETA_PID
exec $VISTO_UI_BETA_HOME/current/node_modules/grunt-cli/bin/grunt start 2>&1

