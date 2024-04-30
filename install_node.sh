#!/bin/bash

set -u
#set -x

# See https://askubuntu.com/questions/426750/how-can-i-update-my-nodejs-to-the-latest-version

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm

sudo apt purge nodejs npm

#nvm install node

nvm install 20.10.0
nvm use 20.10.0

#nvm ls
