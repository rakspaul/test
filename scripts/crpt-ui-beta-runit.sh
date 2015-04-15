#!/bin/bash
CRPT_UI_HOME="/home/amp/crpt-ui-beta"
REPORTS_PID=${CRPT_UI_HOME}/crpt-ui-beta.pid
exec ${CRPT_UI_HOME}/bin/crpt-ui -J-Xmx8192m -Dpidfile.path=$REPORTS_PID -Dhttp.port=4050 -Dlogger.resource=${CRPT_UI_HOME}/conf/application-logger.xml -Dconfig.file=${CRPT_UI_HOME}/conf/application.conf 2>&1
