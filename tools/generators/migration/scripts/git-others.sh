#!/bin/bash
set -e

while getopts d: flag
do
    case "${flag}" in
        d) directory=${OPTARG};;
    esac
done

if [ -z ${directory+x} ]; then echo 'Flag -d (directory name) is required!'; exit 1; fi

for file in $(find $directory -maxdepth 1 -not -type d); do git mv $file $directory/_to_manual_check_; done;
git commit -m "Moved target root files into: ($directory)" --no-verify

echo 'Done - moved root target files'
