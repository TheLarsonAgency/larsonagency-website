#!/bin/bash

# Authenticate docker
`aws ecr get-login --region us-east-1`

# Push docker image out
docker push 656288215726.dkr.ecr.us-east-1.amazonaws.com/larsonagency-website:latest

# Find the task ID
task_id="$(aws ecs list-tasks --region us-east-1 --cluster LarsonAgency | grep -A1 taskArns | tail -1 | sed 's/"//g' | cut -d'/' -f2)"

# Restart AWS
aws ecs stop-task --region us-east-1 --cluster LarsonAgency --task $task_id
