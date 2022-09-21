# This is a utility to generate a .env file for non-docker purposes
# The most important piece is serializing the components configuration in a YAML file using base64 to an env variable

die () {
    echo >&2 "$@"
    exit 1
}

[ "$#" -eq 1 ] || die "1 argument required, supported values are local or development"

ENV=$1

case $ENV in

  local)
    export AL_URL=https://xn--slovnk-7va.dev/modelujeme
    FILE=../.env.local
    ;;

  development)
    export AL_URL=https://xn--slovnk-test-scb.mvcr.gov.cz/modelujeme
    FILE=../.env
    ;;

  *)
    die "Unknown env ${ENV}, supported values are local or development"
    ;;

esac

# Takes components.yml, replaces env variables, base64 encodes it without line wrapping
export COMPONENTS=$(cat components.yml | envsubst | base64 -w 0)

# Takes .env.template file, replaces env variables and saves it as a env-specific file
cat .env.template | envsubst \$COMPONENTS > $FILE
