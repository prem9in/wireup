#!/bin/bash
# build.sh
# shell build for project

if [ "$1" == "retail" ]
 then
 export uglify=true
 else
  export uglify=false
fi

cd ./task
node gulpfile.js
cd ..

exit 0
