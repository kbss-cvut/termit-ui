# This is a utility to generate a .env file for non-docker purposes
# The most important piece is serializing the components configuration in a YAML file using base64 to an env variable

# Takes components.yml file and base64 encodes it without line wrapping
export COMPONENTS=$(cat components.yml | base64 -w 0)

# Takes .env.template file, replaces env variables and saves it as a env-specific file
cat .env.template | envsubst \$COMPONENTS > ../.env
