#!/bin/bash
VISTO_UI_HOME="/home/amp/visto-ui"
VISTO_UI_PID=${VISTO_UI_HOME}/visto-ui.pid
#exec ${CRPT_UI_HOME}/bin/crpt-ui -J-Xmx8192m -Dpidfile.path=$REPORTS_PID -Dhttp.port=4040 -Dlogger.resource=${CRPT_UI_HOME}/conf/application-logger.xml -Dconfig.file=${CRPT_UI_HOME}/conf/application.conf 2>&1
echo $$ > $VISTO_UI_PID
exec grunt start 2>&1

