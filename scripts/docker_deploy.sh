#!/bin/bash

# Authenticate docker
`aws ecr get-login --region us-east-1`

# Push docker image out
docker push 656288215726.dkr.ecr.us-east-1.amazonaws.com/larsonagency-website:latest

# Find the task ID
task_id="$(aws ecs list-tasks --region us-east-1 --service-name larsonagency-website --cluster MindHive | grep -A1 taskArns | tail -1 | sed 's/"//g' | cut -d'/' -f2 | cut -d',' -f1)"

# Restart AWS
[ "$task_id" != "" ] && aws ecs stop-task --region us-east-1 --cluster MindHive --task $task_id
