#!/bin/bash -e

# Note:
# 1. Copy this file to /home/amp/visto-ui

VISTO_UI_ENV=`echo $1`
# set default environment to development
VISTO_UI_ENV=${VISTO_UI_ENV:-development}

echo "Deploying into $VISTO_UI_ENV"

ARTIFACT='visto-ui'
VISTO_UI_HOME='/home/amp/visto-ui'
mkdir -p $VISTO_UI_HOME/{shared/node_modules,releases}
RELEASE_FOLDER=$VISTO_UI_HOME/releases/`date +%Y%m%d%H%M%S`
echo "Release folder $RELEASE_FOLDER"

cd /tmp/
rm -Rvf /tmp/$ARTIFACT
#mkdir -p /tmp/$ARTIFACT
#cd /tmp/$ARTIFACT
unzip /tmp/$ARTIFACT.zip -d /tmp/$ARTIFACT
echo "visto-ui unzipped."

echo "Its ${VISTO_UI_ENV} environment !!!"
/sbin/sv d visto-ui

echo "Cleaning up old releases. Only last 5 releases will be retained"
cd $VISTO_UI_HOME/releases/
ls -t | awk -F ' ' 'NR > 5 { system("rm -rf "$0)}'

echo "Copying artifacts into releases folder"
cp -r /tmp/$ARTIFACT $RELEASE_FOLDER
mkdir -p $RELEASE_FOLDER/bin
cp /tmp/visto-ui-runit.sh $RELEASE_FOLDER/bin
chmod 775 $RELEASE_FOLDER/bin/visto-ui-runit.sh

ln -sfn $RELEASE_FOLDER ${VISTO_UI_HOME}/current 
ln -snf $VISTO_UI_HOME/shared/node_modules $VISTO_UI_HOME/current/node_modules

cd $VISTO_UI_HOME/current
npm install

/sbin/sv u visto-ui

rm -Rvf /tmp/$ARTIFACT
rm -Rvf /tmp/$ARTIFACT.zip

echo "VISTO-UI Build deployment completed & Service is started." && exit 0
