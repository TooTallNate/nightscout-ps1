#!/bin/sh
set -e

dir=packed
arch="$(node -p process.arch)"
tag="$(git describe --tags)"

mkdir -p "${dir}"

pkg bin/nightscout-ps1.js \
  --config package.json \
  --output "${dir}/nightscout-ps1-${TAG}" \
  -t node8-alpine,node8-linux,node8-macos,node8-win

for fullpath in "${dir}"/*; do
  # https://stackoverflow.com/a/1403489/376773
  filename="${fullpath##*/}"                      # Strip longest match of */ from start
  dir="${fullpath:0:${#fullpath} - ${#filename}}" # Substring from 0 thru pos of filename
  base="${filename%.[^.]*}"                       # Strip shortest match of . plus at least one non-dot char from end
  ext="${filename:${#base} + 1}"                  # Substring from len of base thru end
  if [ -z "$base" -a -n "$ext" ]; then          # If we have an extension and no base, it's really the base
      base=".$ext"
      ext=""
  fi
  #printf  "$fullpath:\n\tdir  = \"$dir\"\n\tbase = \"$base\"\n\text  = \"$ext\"\n"

  dest="${dir}${base}-${arch}"
  if [ ! -z "${ext}" ]; then
    dest="${dest}.${ext}"
  fi

  mv "${fullpath}" "${dest}"
done
