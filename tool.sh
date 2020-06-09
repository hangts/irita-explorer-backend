#!/bin/bash

function use_dev(){
  export NODE_ENV=development&&
  export MONGODB_HOST=192.168.150.33&&
  export MONGODB_PORT=37017&&
  export MONGODB_USER=csrb&&
  export MONGODB_PSD=csrbpassword&&
  export MONGODB_DATABASE=sync2&&
  env
}

function use_qa(){
  export NODE_ENV=qa&&
  export MONGODB_HOST=192.168.150.33&&
  export MONGODB_PORT=37017&&
  export MONGODB_USER=csrb&&
  export MONGODB_PSD=csrbpassword&&
  export MONGODB_DATABASE=sync2&&
  env
}

function use_prod(){
  export NODE_ENV=product&&
  export MONGODB_HOST=192.168.150.33&&
  export MONGODB_PORT=37017&&
  export MONGODB_USER=csrb&&
  export MONGODB_PSD=csrbpassword&&
  export MONGODB_DATABASE=sync2&&
  env
}


if [ $1 == "d" ] ; then
  use_dev
elif [ $1 == "q" ] ; then
  use_qa
elif [ $1 == "p" ] ; then
  use_prod
fi
