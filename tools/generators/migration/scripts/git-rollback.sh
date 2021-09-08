#!/bin/bash
set -e

while getopts d:p: flag
do
    case "${flag}" in
        d) directory=${OPTARG};;
        p) opath=${OPTARG};;
    esac
done

if [ -z ${directory+x} ]; then echo 'Flag -d (directory name) is required!'; exit 1; fi
if [ -z ${opath+x} ]; then echo 'Flag -p (output path) is required!'; exit 1; fi

for file in $(ls -A $directory); do git mv $directory/$file $opath; done;
git commit -m 'Moved files to its original place' --no-verify

rm -rf $directory

echo 'Done - rollback done!'
