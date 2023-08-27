#!/bin/bash

#获取当前日期
TODAY=$(date +%Y-%m-%d)

git checkout gh-pages
git add .
git commit -m "$TODAY"
git push origin gh-pages -f