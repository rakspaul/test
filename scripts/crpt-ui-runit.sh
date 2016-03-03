#!/bin/bash
CRPT_UI_HOME="/home/amp/crpt-ui-grunt"
REPORTS_PID=${CRPT_UI_HOME}/crpt-ui.pid
#exec ${CRPT_UI_HOME}/bin/crpt-ui -J-Xmx8192m -Dpidfile.path=$REPORTS_PID -Dhttp.port=4040 -Dlogger.resource=${CRPT_UI_HOME}/conf/application-logger.xml -Dconfig.file=${CRPT_UI_HOME}/conf/application.conf 2>&1
grunt devel 2>&1
