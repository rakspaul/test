set -x
source /etc/profile
COMPONENT_NAME="reachui"
ROOT_DIR="reachui"
REACHUI_DEPLOY_PATH=apps
GIT_COM=`echo 0.0.1`
RELEASE="`date +%Y%m%d%H%M`"
rm -fv $ROOT_DIR/*.rpm

if [ -z $GIT_COM ];then 
  echo "GIT_COM variable is not set, it seems you are running script manually"; 
  exit 1;
fi

VERSION=`grep -e "^$" -v $ROOT_DIR/pkg/reachui-changelog.txt | head -1 | tr -d ' '`

if [ -z $VERSION ];then 
  echo "VERSION variable is not set, it seems $ROOT_DIR/pkg/reachui-changelog.txt file is missing"; 
  exit 1;
fi

if [ -d $ROOT_DIR/$REACHUI_DEPLOY_PATH ];then
  rm -rf $ROOT_DIR/$REACHUI_DEPLOY_PATH
fi


ROOT_PATH="$ROOT_DIR/$REACHUI_DEPLOY_PATH/$COMPONENT_NAME"
ROOT_RPM_PATH="$ROOT_DIR/$REACHUI_DEPLOY_PATH/$COMPONENT_NAME/releases/$VERSION"


mkdir -p $ROOT_RPM_PATH 

if [ -d $ROOT_DIR/ ];then
  cp -r $ROOT_DIR/* $ROOT_RPM_PATH
else
  echo "$ROOT_DIR directory do not exist.";
 exit 1;
fi

echo "Now Generating RPM";

cd $ROOT_DIR
#fpm -s dir -t rpm -n reachuirpm reachui amts
fpm -s dir -t rpm -n "$COMPONENT_NAME" -v "$VERSION" -a "all" --maintainer "REACH UI Team" --description "REACHUI" --epoch 1 --verbose apps


if [ $? -eq 0 ];then
  echo "RPM has been generated successfully.";
  echo $VERSION"-"$BUILD_NUMBER"_"$GIT_COM"_"$RELEASE
  echo `pwd` 
  echo ""$VERSION"-"$BUILD_NUMBER"_"$GIT_COM"_"$RELEASE"" > $WORKSPACE/$ROOT_DIR/package_version
else
  echo "RPM generation failed!.";
  exit 1;
fi
