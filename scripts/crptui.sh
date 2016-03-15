#!/bin/bash

CDESK_ENV=`echo $1`
echo "Deploying into $CDESK_ENV"

cd /tmp

if [ $CDESK_ENV == "ewr_dev" ]
then
  echo "Its EWR DEV environment !!!"
  #cp ${CONF_EWR_QA_FILE} ${CONF_FILE}
  mkdir /tmp/crpt-ui-grunt/bin
  cp /tmp/crpt-ui-grunt/scripts/crpt-ui-runit.sh  /tmp/crpt-ui-grunt/bin/
  echo "Copying build to amp home directory"
  cp -r /tmp/crpt-ui-grunt/* /home/amp/crpt-ui-grunt/
  echo "Removing build from /tmp directory"
  rm -Rvf /tmp/crpt-ui-grunt
  /sbin/sv t crpt-ui-grunt
elif [ $CDESK_ENV == "ewr_qa" ]
then
  mkdir /tmp/visto-ui/bin
  cp /tmp/visto-ui/scripts/crpt-ui-runit.sh  /tmp/visto-ui/bin/
  echo "Copying build to amp home directory"
  cp -r /tmp/visto-ui/* /home/amp/visto-ui/
  echo "Removing build from /tmp directory"
  rm -Rvf /tmp/visto-ui
  /sbin/sv t visto-ui
elif [ $CDESK_ENV == "ewr_stg" ]
then
  mkdir /tmp/visto-ui/bin
  cp /tmp/visto-ui/scripts/crpt-ui-runit.sh  /tmp/visto-ui/bin/
  echo "Copying build to amp home directory"
  cp -r /tmp/visto-ui/* /home/amp/visto-ui/
  echo "Removing build from /tmp directory"
  rm -Rvf /tmp/visto-ui
  /sbin/sv t visto-ui
elif [ $CDESK_ENV == "ewr_prod" ]
then
  mkdir /tmp/visto-ui/bin
  cp /tmp/visto-ui/scripts/crpt-ui-runit.sh  /tmp/visto-ui/bin/
  echo "Copying build to amp home directory"
  cp -r /tmp/visto-ui/* /home/amp/visto-ui/
  echo "Removing build from /tmp directory"
  rm -Rvf /tmp/visto-ui
  /sbin/sv t visto-ui
else
  echo "No environment set for the build !!"
  exit
fi

echo "Build deployment completed & Service is started." && exit 0
