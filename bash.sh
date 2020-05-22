#!/bin/bash

function recover_config_file(){
    git checkout -- config/config.json
}

function use_dev(){
    npm run params dev,dbhost,dbport,user,psd
}

function use_qa(){
    npm run params dev,dbhost,dbport,user,psd
}

function use_stage(){
    npm run params dev,dbhost,dbport,user,psd
}


if [ $1 == "r" ] ; then
    recover_config_file
    elif [ $1 == "d" ] ; then
    echo "build dev"
    use_dev
    elif [ $1 == "q" ] ; then
    use_qa
    elif [ $1 == "s" ] ; then
    use_stage
fi
