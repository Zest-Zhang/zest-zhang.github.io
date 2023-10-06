---
title: 用了1年git后，我总结了这些常用代码
layout: post
tags: blog
date: 2023-09-04
---


本篇文章并不是 git 操作的全面科普，而是对 git 常用操作的代码和使用场景进行总结。

以下是 git 的常用代码和使用场景：

## 上传新仓库

使用场景：在桌面新建项目，想把这个项目上传到 github 上的新仓库时。

代码：

```sh
# 右键 git bash 需要上传的目录，依次输入以下代码：
git init
git add .
git status
git commit -m "注释"
git remote add origin url
git push origin master
```

根据需要修改 commit message（就是 注释 二字），url 则是在 github 新建仓库后复制一下即可。

## 使用git push上传

使用场景：master 分支使用 git push 上传（而不是 git push origin master）

代码：

```sh
git push --set-upstream origin master
```

它的作用很明显，可以少打两个单词。

如果有其他分支也想这样做，比如 gh-pages 分支，假设已经新建了 gh-pages 分支，使用以下代码：

```sh
git checkout gh-pages
git push --set-upstream origin gh-pages
```

以后先用 git checkout gh-pages 切换到 gh-pages 分支，再使用 git push 即可。

## git 提交超时

使用场景：出现 Failed to connect to github.com port 443 after 21074 ms: Timed out 的超时错误

代码：

```bash
# 增加代理
git config --global http.proxy 'socks5h://127.0.0.1:7890'

# 增加 config 文件
$ cat ~/.ssh/config
Host github.com
Hostname ssh.github.com
IdentityFile /c/users/xxx/.ssh/github_id_rsa
User git
Port 443
ProxyCommand connect -S 127.0.0.1:7890 %h %p
```

这个错误困扰过我很久，明明网络不卡、上 github 也没问题，一提交就出现超时的问题，后来在 v2ex 看到相同问题的帖子，用里面的方法（就是以上代码）解决了问题。

## 撤销变更

使用场景：想要撤销自己 push 到 github 上的代码

代码：

```sh
# 获取历史 commit 记录
git reflog
# HEAD 改成想要回溯到的 commit
git reset HEAD
git push origin master -f
```

需要注意，git reset 个人用可以，团队配合用 git revert 更好，原因看演示：

当前处于 C2 这个 commit 状态上，使用 git revert C2：

![uTools_1679408783870](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1679408783870.png)

奇怪，撤销的 commit 记录后面居然多了一个新 commit ，原因：新 commit 记录 C2' 引入了更改，这些更改刚好是用来撤销 C2 这个 commit 的，也就是说，C2' 的状态与 C1 是相同的，revert 之后就可以把更改推送到远程 repo 与别人分享了。

不过，revert 的 commit 参数和 reset 不太一样，reset 的参数使用后就回到了参数对应的那个 commit 记录，revert 参数使用后回到了该参数的上一 个 commit 记录，而且不会影响前面的 commit 记录，reset 使用后前面的 commit 记录会消失，用 git log 查询不到，可以用 git reflog 查询。

## feature分支

使用场景：开发一个新功能就新建 feature 分支，避免把 dev 分支搞乱，在 feature 上开发，完成后，新功能开发好就把 feature 分支合并到开发分支 dev，最后，删除 feature 分支。

代码：

```sh
# 开发代号为 vulcan 的新功能
git checkout -b feature-vulcan
checkouted to a new branch 'feature-vulcan'
```

```sh
# vulcan 功能开发好了
git add vulcan.js
git status
On branch feature-vulcan
	new file:   vulcan.js

git commit -m "add feature vulcan"
```

```sh
# 合并到开发分支 dev，然后删除 feature、切换到 dev：
git rebase dev
git branch -d feature-vulcan
git checkout dev
```

如果突然接到上级命令，因为 xx 原因，新功能取消，所以在 feature 没合并到 dev 时强行删除 feature：

```sh
git branch -D feature-vulcan
```

（使用小写的参数 -d 会删除失败，因为 feature-vulcan 分支还没被合并，如果删除，将丢失掉修改）

## bug分支

使用场景：每个 bug 都可以通过新建一个 bug 分支修复，修复后，合并分支，然后将临时分支删除。所以，当你接到任务（修复一个代号 101 的 bug）时，很自然地，你想创建一个分支 issue-101 来修复它。但是，当前正在dev上进行的工作还没有提交，不是你不想提交，而是工作只进行到一半，还没法提交，预计完成还需 1 天时间。此时，要在两个小时内修复这个 bug，如何处理？

代码：

```sh
# 前提：在 dev 上工作且生产分支是 master，bug 来自生产分支 master
# 使用 git stash 保存 dev 上进行到一半的工作
git stash
# 先确定要在哪个分支上修复 bug，假定需要在 master 分支上修复，就在 master 分支上创建 bug 分支
git checkout master
git checkout -b issue-101
```

```sh
# 修复 bug：把“git is free software ...”改为“git is a free software ...”，然后提交
git add readme.txt 
git commit -m "fix bug 101"
```

```sh
# 修复完成后，切换到 master 分支，并完成合并，最后删除 issue-101 分支
git checkout master
git merge --no-ff -m "merged bug fix 101" issue-101
# bug 已经修复，继续回 dev 分支工作
git checkout dev
# 恢复 dev 上进行到一半的工作并删除 stash 记录
git stash pop
```

在 master 上修复 bug 后，由于 dev 是从 master 上分出来的，所以，这个 bug 其实在当前 dev 分支上也存在。

如何在 dev 上修复同样的 bug？

git 提供了 cherry-pick 命令，它能复制一个特定的提交到当前分支：

```sh
# 把在 issue-101 分支上的提交记录 4c805e2 复制到 dev 分支
git checkout dev
git cherry-pick 4c805e2
```

使用 git cherry-pick 后，就不用在 dev 分支上把修 bug 的过程再重复一遍了。

cherry-pick 实战：

* gh-pages 上有两个文件：
    ![1](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1693813494285.png)
* 切换到 master 分支（只有一个文件）：
    ![2](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1693813521925.png)
* 把 gh-pages 提交第二个文件时的 commit 号复制一下，然后使用 cherry-pick（发现 master 分支上也有第二个文件了）：
    ![3](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1693813576650.png)

## git stash保存未commit的代码

使用场景：某一天，你正在 feature 分支开发新需求，突然产品经理跑过来说线上有 bug，必须马上修复。此时，你在 dev 分支上开发功能，开发到一半，于是你想切到 master 分支，就会看到以下报错：

![img](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/68f81dbc24944538bf63d8530f62cc2a%7Etplv-k3u1fbpfcp-zoom-in-crop-mark_1304_0_0_0.webp)

因为当前有文件更改了，需要提交 commit 保持工作区干净才能切分支。由于情况紧急，你只有 commit 上去，commit 信息也随便写了个“暂存代码”，于是该分支提交记录多了一条黑历史。

这时，可以用 git stash 将未 commit 的代码存起来，让你的工作目录变得干净，然后就能提交、尝试修复 bug 了，后续再用 git stash pop 恢复 dev 分支上未 commit 的代码。

代码：

```sh
# 保存 master 分支未commit的代码，然后就能切换到 bug 分支了
git stash
# 推荐用 pop，恢复的同时删除stash记录
git stash pop
# 修复完线上问题，切回 feature 分支并恢复代码
# 用 git stash apply 恢复后，stash 内容并没有删除，还要用 git stash drop 删除，比较麻烦
git stash apply
# 保存当前未 commit 的代码并添加备注
git stash save "备注"
# 查看 stash 记录
git stash list
# 删除 stash 记录
git stash clear
```

实战如下：

（mater 分支）没有 commit 的 1.txt（内容是 21）用 git stash 保存起来：
![uTools_1693750009531](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1693750009531.png)

切换到 gh-pages 分支（1.txt 干干净净）：

![uTools_1693750069262](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1693750069262.png)

切换回 master 分支（这里的 1.txt 是空的）：

![uTools_1693750169574](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1693750169574.png)

恢复上次在 master 上修改的文件（git stash apply）：

![uTools_1693750257703](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1693750257703.png)

## PR

使用场景：Pull Request 指的是自己修改源代码后，请求对方采纳该修改时的一种行为，比如 修复 bug 后请求对方采纳该 bug。

步骤:

* fork

* clone

* 通过看最右边的蓝色括号内容确认 branch（后面同理）

* 在 clone 出来的目录上 git bash

* 创建其他 branch
    （创建一个 work branch，用来 PR）
    创建 wok branch 并自动切换：git checkout -b work

* 添加或修改 codes

* git diff 检查修改是否完成

* 用浏览器打开，查看显示效果是否正常（二次确认），
    无错后将添加的 codes  commit 至本地 repo 
    git add index.html
    git commit -m "message"

* 创建远程branch
    要从 gitHub 发送 Pull Request，**gitHub 端的 repo 中必须有一个包含了修改后代码的branch**，现在创建本地 work branch 的相应远程 branch
    git push origin work

* 打开 gitHub 的“用户名/first--pr”页，确认 work  branch 是否被创建，以及是否已包含添加的代码

* 在 github 的自己的 repo 里点击 Pull Request，然后点击 work branch 比较添加或修改的代码差异，如下图（绿色的内容是修改的）
    ![uTools_1679971577827](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1679971577827.png)

* 确认内容无误后点击 create Pull Request，然后在评论栏中简明扼要地描述本次进行 Pull Request 的理由

* 点击 Send Pull Request 发送 PR，等待管理员合并即可

* 不进行 Fork 直接从 branch 发送 Pull Request
    这个方法也值得在 gitHub上 进行开发的团队借鉴
    一般说来，在 gitHub 上修改对方的代码时，需要先将 repo  Fork 到本地，然后再修改代码，发送 Pull Request，
    但是，如果用户对该 repo 有编辑权限（可能是项目经理邀请开发人员），则可以直接创建 branch ，从 branch 发送 Pull Request。利用这一设计，团队开发时不妨为每一名成员赋予编辑权限，免去 Fork仓 库的麻烦。这样，成员在有需要时就可以创建自己的 branch ，然后直接向 master  branch 等发送 Pull Request

* 为了避免 PR 冲突，PR 前，要拉取（git fetch + git merge）最新代码，PR 冲突的解决方法如下：
    使用场景：PR 冲突：PR 的人太多，来不及合并，比如：[1](https://github.com/ituring/first-pr/pull/2378)、[2](https://github.com/ituring/first-pr/pull/2379) PR 修改同一地方，1 先被合并，2 的页面出现以下状态：
    （提示 index.html 冲突了，需要先解决这个冲突，然后重新 push）![uTools_1680774812598](https://raw.githubusercontent.com/Zest-Zhang/blog-img/master/uTools_1680774812598.png)
    代码：
    
    ```sh
    # 方法：拉取最新代码
    # 远程分支是 gh-pages，包含 pr 的本地分支是 master
    git remote add upstream https://github.com/ituring/first-pr
    # git fetch + git merge 可以先将远程仓库中的代码拉取到本地仓库中，再手动进行代码合并
    # git pull 拉取代码的同时进行代码合并，这样可能会覆盖本地的修改，更推荐用 git fetch + git merge
    git fetch origin gh-pages
    git checkout master
    git merge origin gh-pages
    # 打开 bash 上提示冲突的文件并修改
    ```



很多知识其实都是这样：看书或看视频不如自己实际操作一遍。所以，在文章的最后推荐一个不错的 git 练习网站，点击[这里](https://learngitbranching.js.org/?locale=zh_CN)进入。

以上就是 git 的常用代码和使用场景，感谢阅读~