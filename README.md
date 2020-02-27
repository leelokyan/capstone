# Capstone

## First Time Setup Instructions:
1. Download Node.js (https://nodejs.org/en/)
2. Pull repository
3. Change to repository: `cd capstone`
4. Download node modules locally: `npm install`

## How to Download a New Node.JS Module:
1. Install node module locally: `npm install "module_name" --save`
2. Commit package.json and package-lock.json

## Start Server:
1. `node server.js`
2. Launch browser at localhost:4000

## Notes:
- Before editing/running server or route files do a `npm install` to ensure that your local project has any new node modules.
- For development you can install the node module nodemon. This module will automatically relaunch the server when a file is changed (saved). Run `nodemon server.js` instead of `node sever.js`.