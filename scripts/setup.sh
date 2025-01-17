#!/bin/bash

# Check if running on a supported system
case "$(uname -s)" in
Linux)
  if [[ -f "/etc/lsb-release" ]]; then
    . /etc/lsb-release
    if [[ "$DISTRIB_ID" != "Ubuntu" ]]; then
      echo "This script only works on Ubuntu, not $DISTRIB_ID."
      exit 1
    fi
  else
    if [[ "$(cat /etc/*-release | grep '^ID=')" =~ ^ID=\"(centos|debian|arch|ubuntu)\"$ ]]; then
      echo "Running on Linux."
    else
      echo "Unsupported Linux distribution."
      exit 1
    fi
  fi
  ;;
Darwin)
  echo "Running on MacOS."
  ;;
*)
  echo "Unsupported operating system."
  exit 1
  ;;
esac

# Check if needed dependencies are installed and install if necessary
if ! command -v node >/dev/null || ! command -v git >/dev/null || ! command -v yarn >/dev/null; then
  case "$(uname -s)" in
  Linux)
    if [[ "$(cat /etc/*-release | grep '^ID=' | grep -i ubuntu)" ]]; then
      sudo apt-get update
      sudo apt-get -y install nodejs git yarn
    elif [[ "$(cat /etc/*-release | grep '^ID=' | grep -i debian)" ]]; then
      sudo apt-get update
      sudo apt-get -y install nodejs git yarn
    elif [[ "$(cat /etc/*-release | grep '^ID=' | grep -i centos)" ]]; then
      sudo yum -y install epel-release
      sudo yum -y install nodejs git yarn
    elif [[ "$(cat /etc/*-release | grep '^ID=' | grep -i arch)" ]]; then
      sudo pacman -Syu -y
      sudo pacman -S -y nodejs git yarn
    else
      echo "Unsupported Linux distribution"
      exit 1
    fi
    ;;
  Darwin)
    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    brew install node git yarn
    ;;
  esac
fi

# Clone the repository and install dependencies
rm -rf ChatGPT-Next-Avatar
git clone https://github.com/monk-after-90s/ChatGPT-Next-Avatar.git
cd ChatGPT-Next-Avatar || exit
yarn install

# Prompt user for environment variables
read -p "Enter BASE_URL: " BASE_URL
read -p "Enter OPENAI_API_KEY: " OPENAI_API_KEY
read -p "Enter CODE: " CODE
read -p "Enter PORT: " PORT
read -p "Enter DIGMAN_BASEURL: " DIGMAN_BASEURL

# Build and run the project using the environment variables
OPENAI_API_KEY=$OPENAI_API_KEY CODE=$CODE PORT=$PORT DIGMAN_BASEURL=$DIGMAN_BASEURL BASE_URL=$BASE_URL yarn build
OPENAI_API_KEY=$OPENAI_API_KEY CODE=$CODE PORT=$PORT DIGMAN_BASEURL=$DIGMAN_BASEURL BASE_URL=$BASE_URL nohup yarn start &