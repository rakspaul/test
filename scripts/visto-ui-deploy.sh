#!/bin/bash

# Note:
# 1. Copy this file to /home/amp/visto-ui

VISTO_UI_ENV=`echo $1`
# set default environment to development
VISTO_UI_ENV=${VISTO_UI_ENV:-development}

echo "Deploying into $VISTO_UI_ENV"

ARTIFACT='visto-ui'
VISTO_UI_HOME='/home/amp/visto-ui'
mkdir -p $VISTO_UI_HOME/{shared,releases}
RELEASE_FOLDER=$VISTO_UI_HOME/releases/`date +%Y%m%d%H%M%S`

cd /tmp/
rm -Rvf /tmp/$ARTIFACT
mkdir -p visto-ui
unzip /tmp/$ARTIFACT.zip -d /tmp/visto-ui
echo "visto-ui unzipped."

echo "Its ${VISTO_UI_ENV} environment !!!"
/sbin/sv d visto-ui

cp -r /tmp/$ARTIFACT $RELEASE_FOLDER
mkdir -p $RELEASE_FOLDER/bin
cp /tmp/visto-ui-runit.sh $RELEASE_FOLDER/bin
chmod 775 $RELEASE_FOLDER/bin/visto-ui-runit.sh

#if [ -d "${RELEASE_FOLDER}/conf/${VISTO_UI_ENV}" ]
#then
#  cp ${RELEASE_FOLDER}/conf/${VISTO_UI_ENV}/* ${RELEASE_FOLDER}/conf/
#fi

#if [ -d "${VISTO_UI_HOME}/shared/conf/" ]
#then
#  cp ${VISTO_UI_HOME}/shared/conf/* ${RELEASE_FOLDER}/conf/
#fi

#cp ${RELEASE_FOLDER}/scripts/visto-api-runit.sh ${RELEASE_FOLDER}/bin
#chmod 755 ${RELEASE_FOLDER}/bin/visto-api-runit.sh

ln -sfn $RELEASE_FOLDER ${VISTO_UI_HOME}/current 

/sbin/sv u visto-ui

echo "VISTO-UI Build deployment completed & Service is started." && exit 0