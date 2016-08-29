#!/bin/bash

sass style/site.scss:static/css/site.css
sass style/site.scss:static/css/site.min.css --style compressed

exit $?
