#!/usr/bin/env bash

_dir=$(dirname $0)
_in=$(cat ${_dir}/in.txt | node ${_dir}/../lib/bin.js)
_out=$(cat ${_dir}/out.txt)

if [ "${_in}" == "${_out}" ]; then
  exit 0
fi

exit 1
