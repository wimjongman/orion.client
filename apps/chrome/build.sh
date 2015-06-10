#!/bin/bash
orionRoot=$(cd `dirname $0` && pwd)/../../
ant \
  -f ${orionRoot}/releng/org.eclipse.orion.client.releng/builder/buildChrome.xml \
  -Dbasedir=${orionRoot} \
  default
