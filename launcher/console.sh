#!/usr/bin/env bash

red=$(tput setaf 1)
green=$(tput setaf 2)
yellow=$(tput setaf 3)
blue=$(tput setaf 4)
magenta=$(tput setaf 5)
cyan=$(tput setaf 6)
white=$(tput setaf 7)
b=$(tput bold)
u=$(tput rmul)
n=$(tput sgr0)

pwd=$(dirname "$0")
declare -a conf_files=(${pwd}"/.env" ${pwd}"/../.env")
cmd=$1
param1=$2
COMPOSE_IGNORE_ORPHANS=true

function join { local d=$1; shift; echo -n "$1"; shift; printf "%s" "${@/#/$d}"; }

show_help(){
cat <<-EOF

${b}${yellow}USAGE${white}${n}: ./console.sh [CMD]

${b}${yellow}CMD${white}${n}
  ${green}install${n} : Install a local environment
  ${green}start${n} [OPTIONS] : Start a local environment
  ${green}restart${n} [OPTIONS]  : Restart a local environment
  ${green}stop${n} [OPTIONS] : Stop a local environment
  ${green}rm${n} [OPTIONS] : Remove a local environment

${b}${yellow}OPTIONS${white}${n}
  ${green}-env | --environment${n} : Only apply command on datastores containers
  ${green}-dst | --datastores-only${n} : Only apply command on datastores containers
  ${green}-snx | --synaptix-only${n}   : Only apply command on synaptix containers (datastores and synaptix middleware modules)
  ${green}-all | --all         ${n}    : Start complete stack.
EOF
}

if [ "$#" -ge 2 ] ; then
    cmd="$1"
    param1="$2"
elif [ "$#" -eq 1 ]; then
    cmd="$1"
    param1="-1"
else
    show_help
    exit 1
fi

if [ "$REMOTE_MODE" = "1" ] ; then
  cat <<-EOF
${b}${red}/!\ REMOTE MODE ENABLED ${white}${n}
${b}${red}You may be using data directly from Production datastores. Be careful !${white}${n}
EOF

 declare -a compose_files=(
   ${pwd}"/conf/docker/remote/docker-compose.yml"
 )
else
  declare -a compose_files=(
   ${pwd}"/conf/docker/local/docker-compose-0-datastores.yml"
   ${pwd}"/conf/docker/local/docker-compose-1-sso.yml"
 )

  while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`
    case $PARAM in
        -dts | --datastores-only)
        ;;

        -snx | --synaptix-only)
            compose_files+=(
              ${pwd}"/conf/docker/local/docker-compose-2-synaptix.yml"
            )
        ;;

        -env | --environment)
          conf_files+=($2)
        ;;

        *)
            compose_files+=(
              ${pwd}"/conf/docker/local/docker-compose-2-synaptix.yml"
            )
        ;;
    esac
    shift
done
fi

show_env(){
cat <<-EOF

${b}${yellow}ENVIRONMENT${n}
  ${green}Env. files${n}      :
`
for conf_file in "${conf_files[@]}"
do
    echo "      $conf_file"
done
`
  ${green}Compose files${n}      :
`
for compose_file in "${compose_files[@]}"
do
    echo "      $compose_file"
done
`
  ${green}Environment${n}        : ${ENV}
  ${green}Solution${n}           : ${SOLUTION_NAME}
  ${green}Project${n}            : ${COMPOSE_PROJECT_NAME}
  ${green}Data Folder${n}        : ${DATA_PATH}

EOF
}

load_env(){
  for conf_file in "${conf_files[@]}"
  do
  [[ -f ${conf_file} ]] && {
    set -o allexport
    source $conf_file;
    set +o allexport
  }
  done
  show_env
}

install(){
    local force=$1

    if [ $force == "-f" ] ; then
        echo "Data directory overwriting : ($DATA_PATH)"
        rm -rf $DATA_PATH
    else
        [[ -d $DATA_PATH ]] && {
            echo -e "\033[31mData directory already exists : $DATA_PATH"
            echo -e "Use the -f option to overwrite it.\033[0m"
        } && exit 1
    fi

    mkdir -p -v -m 775 $DATA_PATH

    [[ ! -d $DATA_PATH ]] && (echo -e "\033[31mImpossible to create data directory : $DATA_PATH\033[0m";) && exit 1

    cp -r ${pwd}/bootstrap/* $DATA_PATH

    echo -e "\033[32mInstallation OK.\033[0m"
}

start(){
  if [ "$REMOTE_MODE" != "1" ] ; then
    [[ ! -d $DATA_PATH ]] && (
        echo -e "[\033[31merror] Data repository $DATA_PATH doesn't exists. Please run install command before starting. \033[0m";
    ) && exit 1
  fi

  docker-compose -f $(join " -f " ${compose_files[@]}) up -d
}

restart(){
    docker-compose -f $(join " -f " ${compose_files[@]}) restart
}

stop(){
    docker-compose -f $(join " -f " ${compose_files[@]}) stop
}

rm(){
    docker-compose -f $(join " -f " ${compose_files[@]}) rm
}

# LOAD ENVIRONMENT VARIABLES
load_env

if [ ${cmd} ] && [ ${param1} ]; then
    case $cmd in
        info) show_env ;;

        help) show_help ;;

        install) install $param1 ;;

        start) start ;;

        stop) stop ;;

        restart) restart ;;

        rm) rm ;;

        *) show_help ;;
    esac
else
    show_help
fi
exit 0
