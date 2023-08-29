#!/bin/bash

#获取当前日期
TODAY=$(date +%Y-%m-%d)

git add .
git commit -m "$TODAY"
git push origin master -f