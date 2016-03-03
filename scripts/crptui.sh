#!/bin/bash

CDESK_ENV=`echo $1`

echo "Deploying into $CDESK_ENV"

cd /tmp

if [ $CDESK_ENV == "ewr_dev" ]
then
  echo "Its EWR DEV environment !!!"
  #cp ${CONF_EWR_QA_FILE} ${CONF_FILE}
  cp /tmp/crpt-ui-grunt/scripts/crpt-ui-runit.sh  /tmp/crpt-ui-grunt/bin/
  cp -r /tmp/crpt-ui-grunt/* /home/amp/crpt-ui-grunt/
  rm -Rvf /tmp/crpt-ui-grunt
  /sbin/sv t crpt-ui-grunt
elif [ $CDESK_ENV == "ewr_qa" ]
then
  echo "Its EWR QA environment !!!"
  #cp ${CONF_EWR_QA_FILE} ${CONF_FILE}
  cp /tmp/crpt-ui-grunt/scripts/crpt-ui-runit.sh  /tmp/crpt-ui-grunt/bin/crpt-ui-runit.sh
  cp -r /tmp/crpt-ui-grunt/* /home/amp/crpt-ui-grunt/
  rm -Rvf /tmp/crpt-ui-grunt
  /sbin/sv t crpt-ui-grunt
elif [ $CDESK_ENV == "ewr_stg" ]
then
  echo "Its EWR Staging environment !!!"
  cp ${CONF_EWR_STG_FILE} ${CONF_FILE}
  cp /tmp/crpt-ui-1.0-SNAPSHOT/scripts/crpt-ui-runit.sh  /tmp/crpt-ui-1.0-SNAPSHOT/bin/crpt-ui-runit.sh
  cp -r /tmp/crpt-ui-1.0-SNAPSHOT/* /home/amp/crpt-ui/
  rm -Rvf /tmp/crpt-ui-1.0-SNAPSHOT
  /sbin/sv t crpt-ui
elif [ $CDESK_ENV == "ewr_prod" ]
then
  echo "Its EWR Production environment !!!"
  cp ${CONF_EWR_PROD_FILE} ${CONF_FILE}
  cp /tmp/crpt-ui-1.0-SNAPSHOT/scripts/crpt-ui-runit.sh  /tmp/crpt-ui-1.0-SNAPSHOT/bin/crpt-ui-runit.sh
  cp -r /tmp/crpt-ui-1.0-SNAPSHOT/* /home/amp/crpt-ui/
  rm -Rvf /tmp/crpt-ui-1.0-SNAPSHOT
  /sbin/sv t crpt-ui
else
  sudo /etc/init.d/crpt-ui stop
  echo "Its prod !!!"
  echo "Copying application_prod.conf to application.conf"
  cp ${CONF_PROD_FILE} ${CONF_FILE} 
  cp -r /tmp/crpt-ui-1.0-SNAPSHOT /home/amp/crpt-ui_new/
  sudo cp /tmp/crpt-ui /etc/init.d/crpt-ui
  sudo chmod 755 /etc/init.d/crpt-ui
  sudo chkconfig --add crpt-ui
  sudo /etc/init.d/crpt-ui start
fi


echo "Build deployment completed & Service is started." && exit 0
