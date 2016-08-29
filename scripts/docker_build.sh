#!/bin/bash

docker build -t larsonagency-website .
docker tag larsonagency-website:latest 656288215726.dkr.ecr.us-east-1.amazonaws.com/larsonagency-website:latest
#docker push 656288215726.dkr.ecr.us-east-1.amazonaws.com/larsonagency-website:latest

exit 0
