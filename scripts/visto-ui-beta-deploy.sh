#!/bin/bash -e

# Note:
# 1. Copy this file to /home/amp/visto-ui

VISTO_UI_ENV=`echo $1`
# set default environment to development
VISTO_UI_ENV=${VISTO_UI_ENV:-development}

echo "Deploying into $VISTO_UI_ENV"

ARTIFACT='visto-ui-beta'
VISTO_UI_HOME='/home/amp/visto-ui-beta'
mkdir -p $VISTO_UI_HOME/{shared/node_modules,releases}
RELEASE_FOLDER=$VISTO_UI_HOME/releases/`date +%Y%m%d%H%M%S`
echo "Release folder $RELEASE_FOLDER"

cd /tmp/
rm -Rvf /tmp/$ARTIFACT
unzip /tmp/$ARTIFACT.zip -d /tmp/$ARTIFACT
echo "visto-ui-beta unzipped."

echo "Its ${VISTO_UI_ENV} environment !!!"
/sbin/sv d visto-ui-beta

cp -r /tmp/$ARTIFACT $RELEASE_FOLDER
mkdir -p $RELEASE_FOLDER/bin
cp /tmp/visto-ui-beta-runit.sh $RELEASE_FOLDER/bin
chmod 775 $RELEASE_FOLDER/bin/visto-ui-beta-runit.sh

ln -sfn $RELEASE_FOLDER ${VISTO_UI_HOME}/current 
ln -snf $VISTO_UI_HOME/shared/node_modules $VISTO_UI_HOME/current/node_modules

cd $VISTO_UI_HOME/current
npm install

/sbin/sv u visto-ui-beta

rm -Rvf /tmp/$ARTIFACT
rm -Rvf /tmp/$ARTIFACT.zip

echo "VISTO-UI Beta Build deployment completed & Service is started." && exit 0