#!/bin/bash

CDESK_ENV=`echo $1`

echo "Deploying into $CDESK_ENV"

cd /tmp

rm -Rvf /tmp/crpt-ui-1.0-SNAPSHOT

unzip crpt-ui-1.0-SNAPSHOT.zip
echo "CRPT UI SnapShot unzipped."


CONF_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application.conf
CONF_QA_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application_qa.conf
CONF_EWR_STG_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application.ewr_stg.conf
CONF_EWR_PROD_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application.ewr_prod.conf
CONF_PROD_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application_prod.conf

if [ $CDESK_ENV == "qa" ]
then
  sudo /etc/init.d/crpt-ui stop
  echo "Its QA environment !!!"
  echo "Changing copying application_qa.conf to application.conf"
  cp ${CONF_QA_FILE} ${CONF_FILE} 
  sudo cp /home/amp/crpt-ui/crpt-ui /etc/init.d/crpt-ui
  sudo chmod 755 /etc/init.d/crpt-ui
  sudo chkconfig --add crpt-ui
  sudo /etc/init.d/crpt-ui start
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
  sudo cp /home/amp/crpt-ui/crpt-ui /etc/init.d/crpt-ui
  sudo chmod 755 /etc/init.d/crpt-ui
  sudo chkconfig --add crpt-ui
  sudo /etc/init.d/crpt-ui start
fi


echo "Build deployment completed & Service is started." && exit 0
