import requests
from requests.structures import CaseInsensitiveDict

def CallAPI(centresBlue, centresRed, pygameArrayRed,pygameArrayBlue):
    resp = 0
    global cancelShot
    cancelShot = False

    # print('API Thread Running')
    url = "https://elatedtwist.backendless.app/api/services/Game/score-standard"
    headers = CaseInsensitiveDict()
    headers["Content-Type"] = "application/json"
    global shotPlayed, shotFinished, shotActive, sumOfPoints
    if shotPlayed:
        print("Shot played")
        shotActive = True
    
    if shotActive and not shotFinished:                 
        try:
            # print("Attempting End of round Thread")
            argss = (pygameArrayRed,pygameArrayBlue)
            start_new_thread(endOfRound,argss)
        
        except Exception as e:
            print("An error occurred in the end of round thread: " + str(e)) 
    
        
    blue = ",".join(centresBlue)
    red = ",".join(centresRed)
    
    blueJSON = '{"locations":[' + blue + ']}'
    redJSON = '{"locations":[' + red + ']}'

    data = '{"tableNo": 1, "puckLocationsRed":' + redJSON + ', "puckLocationsBlue": ' + blueJSON + ', "shotPlayed": "False" , "shotFinished": "False"}'
    # print(data)
    
    if shotPlayed:
        shotPlayed = False
        data = '{"tableNo": 1, "puckLocationsRed":' + redJSON + ', "puckLocationsBlue": ' + blueJSON + ', "shotPlayed": "True" , "shotFinished": "False"}'

        
    if shotFinished:
        data = '{"tableNo": 1, "puckLocationsRed":' + redJSON + ', "puckLocationsBlue": ' + blueJSON + ', "shotPlayed": "False" , "shotFinished": "True"}'
        shotFinished = False 
        sumOfPoints = 0
        cancelShot = True
        print("stopping")
    
    
    
    if shotActive:
        print("Sending Data")
        resp = requests.post(url, headers=headers, data=data)
        print(data)
        if cancelShot:
            shotActive = False
            return 0
    
    return(resp)


