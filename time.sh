#!/bin/bash

#获取当前日期
TODAY=$(date +%Y-%m-%d)

git add .
# 配置默认字符集为 UTF-8，避免 commit 乱码
git config --global i18n.commitencoding utf-8
git commit -m "$TODAY"
git push origin gh-pages -f