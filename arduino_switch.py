import pyfirmata
import time
import requests
import socket
from requests.structures import CaseInsensitiveDict


#s = socket.socket()
#s.connect(('127.0.0.1',9999))

#print(s)

headers = CaseInsensitiveDict()
headers["Content-Type"] = "application/json"

board = pyfirmata.Arduino('/dev/cu.usbmodem1101')

it = pyfirmata.util.Iterator(board)
it.start()

switchPin = board.digital[2]

switchPin.mode = pyfirmata.INPUT
time.sleep(1)

print('ready')
shotCount = 0
while True:
    sw = switchPin.read()
    #print(sw)
    #print(time.perf_counter())
    
    if sw is True:

            print('Inside')
            shotCount += 1

            #s.send(str.encode("Puck just went through dude"));
            #print('Shot Number: ' + str(shotCount))
            #print("Listener:",s.recv(1024).decode())

            #time.sleep(0.05)

            #s.send(str.encode("Did you hear me?"));
            #print("SIGNAL SENT")


            data3 = '{"PythonShotCounter":' + str(shotCount) + '}'
            print(data3)
            
            
            # TODO : Wrap this if error
            resp = requests.patch("http://localhost:3000/TableData/1", headers=headers, data=data3)
            print(resp.status_code)

            print('Shot Number: ' + str(shotCount))

            time.sleep(0.1)
            
            # TODO : Include CV solution to detect throw as well. hands on sensor




