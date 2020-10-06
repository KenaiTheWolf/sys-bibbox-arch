
##!/bin/bash

function installApp() 
{
	var1=$2
        declare keylist
	declare paramlist
        params=$(curl https://raw.githubusercontent.com/bibbox/$var1/master/.env)
	sed s/' '/'='/g <<< $params
        echo https://raw.githubusercontent.com/bibbox/$var1/master/.env
        echo Please enter working user specifications!
	#ext = begin
	keylist="'"
        paramlist="'"
#	echo $params params
#	IFS=' '
#        read -a line <<< $params
#	echo ${line} line
	for item in $params
        do
#	  echo $params
          IFS='='
          read -a strarr <<< $item
#	  echo ch1
#	  echo $item
#	  echo ch2
#	  echo $strarr
#	  echo ch3
#	  echo ${strarr[0]}
	  IFS=$'\n'
          read -a out <<< $item
#	  echo ${out[0]} out
          if [ ${strarr[0]} != 'PORT' ] && [ ${strarr[0]} != 'INSTANCE' ] 
          then
#	    echo check
#	    echo $params
#	    echo check1
 #           echo ${item[0]}
#	    echo check2
#	    echo ${strarr[0]}:
            read param
	    v2=$param
	    v1=${strarr[0]}
	    keylist="$keylist;$v1"
	    paramlist="$paramlist;$v2"
	    fi
	done
        keylist="$keylist'"
        paramlist="$paramlist'"

        var1="'$1'"
        var2="'$2'"
        var3="'$3'"

	echo $keylist
	echo $paramlist

        sudo python3 -c 'import sys; sys.path.insert(1, "/opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.installApp('"$paramlist"','"$keylist"','"$var1"','"$var2"','"$var3"',CLI=True)'
}

function startApp() 
{
	var="'$1'"
	sudo python3 -c 'import sys; sys.path.insert(1, "//opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.startApp('"$var"')'
}

function stopApp() 
{
        var="'$1'"
        sudo python3 -c 'import sys; sys.path.insert(1, "/opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.stopApp('"$var"')'
}

function removeApp() 
{
        var="'$1'"
        sudo python3 -c 'import sys; sys.path.insert(1, "/opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.removeApp('"$var"')'
}

function getStatus() 
{
        var="'$1'"
        sudo python3 -c 'import sys; sys.path.insert(1, "/opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.getStatus('"$var"')'
}

function copyApp() 
{
        var1="'$1'"
	var2="'$2'"
        sudo python3 -c 'import sys; sys.path.insert(1, "/opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.copyApp('"$var1"','"$var2"')'
}

function listApps() 
{
        sudo python3 -c 'import sys; sys.path.insert(1, "/opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.listApps()'
}

function listInstalledApps() 
{
        sudo python3 -c 'import sys; sys.path.insert(1, "/opt/bibbox/sys-bibbox/sys-backend"); import bibboxbackend; bibboxbackend.AppController.listInstalledApps()'
}

#installApp seeddms22 app-seeddmsTNG master
#stopApp seeddms10
#startApp seeddms10
#getStatus seeddms10
#copyApp seeddms10 seeddms11
#removeApp seeddms10
#listApps
#listInstalledApps
