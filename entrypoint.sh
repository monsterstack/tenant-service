#!/bin/bash
set -e

# get the container id
THIS_CONTAINER_ID_LONG=`cat /proc/self/cgroup | grep 'docker' | sed 's/^.*\///' | tail -n1`
# take the first 12 characters - that is the format used in /etc/hosts
THIS_CONTAINER_ID_SHORT=${THIS_CONTAINER_ID_LONG:0:12}
# search /etc/hosts for the line with the ip address which will look like this:
#     172.18.0.4    8886629d38e6
THIS_DOCKER_CONTAINER_IP_LINE=`cat /etc/hosts | grep $THIS_CONTAINER_ID_SHORT`
# take the ip address from this
THIS_DOCKER_CONTAINER_IP=`(echo $THIS_DOCKER_CONTAINER_IP_LINE | grep -o '[0-9]\+[.][0-9]\+[.][0-9]\+[.][0-9]\+')`
echo "this docker container server = $THIS_DOCKER_CONTAINER_IP"
export CONTAINER_IP=$THIS_DOCKER_CONTAINER_IP

eval "$@"
