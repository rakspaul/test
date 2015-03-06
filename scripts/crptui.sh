#!/bin/bash

CDESK_ENV=`echo $1`

echo "Deploying into $CDESK_ENV"

cd /home/amp/crpt-ui

sudo /etc/init.d/crpt-ui stop

rm -rf /home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT

unzip /home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT.zip
echo "CRPT UI SnapShot unzipped."

cd /home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT
echo "Changed to unzipped directory."

#cp /home/amp/crpt-ui/application.conf  /home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/
#echo "Copied conf file to conf folder."

CONF_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application.conf
CONF_QA_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application_qa.conf
CONF_PROD_FILE=/home/amp/crpt-ui/crpt-ui-1.0-SNAPSHOT/conf/application_prod.conf

if [ $CDESK_ENV == "qa" ]
then
  echo "Its QA environment !!!"
  echo "Changing copying application_qa.conf to application.conf"
  cp ${CONF_QA_FILE} ${CONF_FILE} 
else
  echo "Its prod !!!"
  echo "Copying application_prod.conf to application.conf"
  cp ${CONF_PROD_FILE} ${CONF_FILE} 

fi
rm -Rf /home/amp/crpt-ui/public
unzip /home/amp/crpt-ui/public.zip
sudo cp /home/amp/crpt-ui/crpt-ui /etc/init.d/crpt-ui
sudo chmod 755 /etc/init.d/crpt-ui
sudo chkconfig --add crpt-ui
sudo /etc/init.d/crpt-ui start

echo "Build deployment completed & Service is started." && exit 0
