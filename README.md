# shuffleTech

### Git clone the folder to your computer

1. Create a folder on your local device
2. cd to that folder
3. Run `git clone https://github.com/mikePitch/shuffleTech.git` 

---
### Run the json server
1. cd to *npm* folder
2. Run `json-server --watch db.json`
3. You should see:

`\{^_^}/ hi!`

`Loading db.json`\
`Done`

`Resources`\
`http://localhost:3000/PuckLocations`\
`http://localhost:3000/TableData`

`Home`\
`http://localhost:3000`

---
### Run the javascript frontend
1. cd to *04-webpack*
2. Run `npm run dev`
3. You should see:

`> dev`\
`> webpack serve --config ./bundler/webpack.dev.js`

`------------------------------------------------------------`\
`192.168.243.138`\
`Project running at:`\
`  - http://192.168.243.138:8080`\
`  - http://localhost:8080`\
`webpack compiled successfully`\

4. Open a browser tab and type the url http://192.168.243.138:8080


---
### Run the python Puck Detection code 
1. Plug the depthAI OAK camera into your laptop
2. cd to *shuffleTech*
3. Run `python3 finalOak3-local3.py`
4. Click `1` for main
5. Play some shuffleboard
- Updated puck locations are found at http://localhost:3000/PuckLocations/1
- Javascript frontend http://192.168.243.138:8080/ should pick up the pucks as you play 
