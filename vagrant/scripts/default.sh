#!/bin/sh 

echo Executing script...
  
if [ ! -e ~/.reachui/Bundle.lock ];
then
  # Bundle install has not been run
  echo
  echo Setting up the environment...
  echo
  
  cd /Projects/reachui && bundle install
  
  if [ $? = 0 ]; then
    echo
    echo Done setting up environment...
    echo
    cd ~ && mkdir .reachui && cd .reachui && touch Bundle.lock
  fi
fi

echo
echo All done!
echo
