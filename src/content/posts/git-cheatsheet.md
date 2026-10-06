---
title: Git 常用命令速查
date: 2026-10-04
tags: [Git, 工具]
category: 技术笔记
description: 把平时真正会用到的那二三十条 Git 命令整理成一张速查表，按使用场景分组。
---

平时写代码最常用的 Git 命令其实就那么几条，但每次遇到"改错了想撤销"、
"分支推错了想改"这类场景，还是得翻文档。索性整理一份自己用的速查表。

## 一、初始化与配置

```bash
# 配置身份（全局）
git config --global user.name "你的名字"
git config --global user.email "你的邮箱"

# 查看当前所有配置
git config --list

# 初始化仓库
git init

# 克隆
git clone git@github.com:user/repo.git
```

> 建议用 SSH 而不是 HTTPS：配一次 key，之后推送就不用反复输密码了。
> 验证方式是 `ssh -T git@github.com`。

## 二、日常提交流程

```bash
git status                 # 看当前状态，最常用的命令没有之一
git add <文件>             # 暂存指定文件
git add .                  # 暂存所有改动
git commit -m "提交说明"    # 提交
git push                   # 推送到远端
```

如果还没配好远端：

```bash
git remote add origin git@github.com:user/repo.git
git push -u origin main    # 第一次推送，-u 记住上游分支
```

## 三、分支操作

```bash
git branch                 # 列出本地分支
git branch -a              # 连远端分支一起列
git switch -c feature/x    # 新建并切换到 feature/x
git switch main            # 切回 main
git merge feature/x        # 把 feature/x 合并进当前分支
git branch -d feature/x    # 删除已合并的分支
```

`git checkout -b` 和 `git switch -c` 效果一样，后者是较新的写法，语义更清晰。

## 四、撤销与回退

这一组最容易搞混，按"改动处在哪个阶段"来记：

| 场景 | 命令 |
| --- | --- |
| 工作区改乱了，还没 `add` | `git restore <文件>` |
| 已经 `add` 了，想取消暂存 | `git restore --staged <文件>` |
| 提交信息写错了 | `git commit --amend` |
| 想撤掉最近一次提交但保留改动 | `git reset --soft HEAD~1` |
| 想彻底丢弃最近一次提交 | `git reset --hard HEAD~1` |
| 已经在远端了，要反向提交一次 | `git revert <commit>` |

⚠️ `git reset --hard` 会真的丢掉改动，执行前先 `git status` 确认一遍。

## 五、查看历史

```bash
git log --oneline -20              # 最近 20 条，一行一条
git log --graph --oneline --all    # 带分支图，看合并关系很直观
git show <commit>                  # 看某次提交改了什么
git diff                           # 工作区 vs 暂存区
git diff --staged                  # 暂存区 vs 上次提交
git blame <文件>                   # 每行是谁什么时候改的
```

## 六、临时保存现场

写了一半要去修 bug，又不想提交：

```bash
git stash          # 把当前改动收起来
git stash list     # 看有哪些 stash
git stash pop      # 恢复最近一个并删除记录
git stash apply    # 恢复但保留记录
```

## 七、几个容易踩的坑

1. **`git pull` 报"diverged branches"**：本地和远端都有新提交。
   确认没有冲突风险后可以用 `git pull --rebase`，把本地提交挪到远端之后。
2. **误提交了大文件**：光删文件没用，历史里还在，得用 `git filter-repo` 或 BFG 清理。
   所以 `.gitignore` 一定要提前写好。
3. **`.gitignore` 对已跟踪文件无效**：得先 `git rm --cached <文件>` 再提交。
4. **换行符问题**：Windows 和 Linux 混用时，建议设 `git config --global core.autocrlf true`。

---

这份表会持续补充，下次再遇到什么奇怪的场景就往里加。
