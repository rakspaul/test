#!/bin/bash
CRPT_UI_HOME="/home/amp/crpt-ui"
REPORTS_PID=${CRPT_UI_HOME}/crpt-ui.pid
exec /home/amp/crpt-ui/bin/crpt-ui -J-Xmx8192m -Dpidfile.path=$REPORTS_PID -Dhttp.port=4040 -Dlogger.resource=/home/amp/crpt-ui/conf/application-logger.xml -Dconfig.file=/home/amp/crpt-ui/conf/application.conf 2>&1
