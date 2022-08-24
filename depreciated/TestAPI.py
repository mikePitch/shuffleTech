import math
import requests
from requests.structures import CaseInsensitiveDict
from requests.structures import CaseInsensitiveDict




print('now im alive')
url = "https://elatedtwist.backendless.app/api/data/PuckLocations"
headers = CaseInsensitiveDict()
headers["Content-Type"] = "application/json"

#Vars to push to API
color = '"Red"'
puckX = 12
puckY = 12
tableID = 1 

data = '{"Color":' + color + ', "TableID":' + str(tableID) + ', "X":' + str(puckX) + ', "Y":' + str(puckY) + '}'

resp = requests.delete(url, headers=headers)
print(resp)
resp = requests.post(url, headers=headers, data=data)
print(resp)