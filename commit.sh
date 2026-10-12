#!/bin/bash
git status
IFS= read -r line
git add .
git commit -m "update"
git push nodegit master
git push github master
