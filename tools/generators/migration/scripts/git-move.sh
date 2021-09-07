#!/bin/bash
set -e

while getopts p:d: flag
do
    case "${flag}" in
        d) directory=${OPTARG};;
        p) suffix=${OPTARG};;
    esac
done

if [ -z ${directory+x} ]; then echo 'Flag -d (directory name) is required!'; exit 1; fi

for file in $(ls -A | grep -v $directory | grep -v '^.git$' | grep -v 'node_modules' | grep -v 'dist'); do git mv $file $directory$suffix; done;
git commit -m "Moved repository into: ($directory$suffix)" --no-verify

echo 'Done - moved files'
