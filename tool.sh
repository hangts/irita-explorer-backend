#!/bin/bash

function use_dev(){
  export NODE_ENV=development&&
  export DB_ADDR=192.168.150.33:37017&&
  export DB_USER=csrb&&
  export DB_PASSWD=csrbpassword&&
  export DB_DATABASE=sync2&&
  env
}

function use_qa(){
  export NODE_ENV=development&&
  export DB_ADDR=192.168.150.33:37017&&
  export DB_USER=csrb&&
  export DB_PASSWD=csrbpassword&&
  export DB_DATABASE=sync2&&
  env
}

function use_prod(){
  export NODE_ENV=development&&
  export DB_ADDR=192.168.150.33:37017&&
  export DB_USER=csrb&&
  export DB_PASSWD=csrbpassword&&
  export DB_DATABASE=sync2&&
  env
}


if [ $1 == "d" ] ; then
  use_dev
elif [ $1 == "q" ] ; then
  use_qa
elif [ $1 == "p" ] ; then
  use_prod
fi
