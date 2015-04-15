#!/bin/bash

CDESK_ENV=`echo $1`

echo "Deploying into $CDESK_ENV"

cd /tmp

rm -Rvf /tmp/crpt-ui-1.0-SNAPSHOT

unzip crpt-ui-1.0-SNAPSHOT.zip
echo "CRPT UI SnapShot unzipped."


CONF_FILE=/tmp/crpt-ui-1.0-SNAPSHOT/conf/application.conf
CONF_EWR_PROD_FILE=/tmp/crpt-ui-1.0-SNAPSHOT/conf/application.ewr_prod.conf

echo "Its EWR Production environment !!!"
cp ${CONF_EWR_PROD_FILE} ${CONF_FILE}
cp /tmp/crpt-ui-1.0-SNAPSHOT/scripts/crpt-ui-beta-runit.sh  /tmp/crpt-ui-1.0-SNAPSHOT/bin/crpt-ui-beta-runit.sh
cp -r /tmp/crpt-ui-1.0-SNAPSHOT/* /home/amp/crpt-ui-beta/
rm -Rvf /tmp/crpt-ui-1.0-SNAPSHOT
/sbin/sv t crpt-ui-beta


echo "Build deployment completed & Service is started." && exit 0
