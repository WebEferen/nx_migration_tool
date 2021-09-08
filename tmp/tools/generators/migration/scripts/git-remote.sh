#!/bin/bash
set -e

while getopts m:b:d:n: flag
do
    case "${flag}" in
        m) master=${OPTARG};;
        b) branch=${OPTARG};;
        n) name=${OPTARG};;
    esac
done

if [ -z ${master+x} ]; then echo 'Flag -m (master repo uri) is required!'; exit 1; fi
if [ -z ${branch+x} ]; then echo 'Flag -b (master repo branch name) is required!'; exit 1; fi
if [ -z ${name+x} ]; then echo 'Flag -n (remote name) is required!'; exit 1; fi

git remote add $name -f $master
git merge $name/$branch --allow-unrelated-histories
git remote remove $name

echo 'Done - adding remote!'
