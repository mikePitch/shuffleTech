#import things
import requests
import cv2
import numpy as np

import json

from threading import Thread
from _thread import *



import requests
from requests.structures import CaseInsensitiveDict
from requests.structures import CaseInsensitiveDict

#set Variables


#dimensions of table in mm
tableWidth = 600
tableLength = 4500
puckRadius = 35
puckArea = puckRadius * puckRadius * 3.14

#number of mm outside table to show in frame
tablePadding = 0

#filter Image Parameters
saturation = 100

# default Corners of table
topLeft = [511,54]
topRight = [737,51]
bottomLeft = [426,711]
bottomRight = [872,695]

#Create an object to hold reference to camera video capturing
cap = cv2.VideoCapture(3)
caplight = cv2.VideoCapture(1)
#check if connection with camera is successfully
if cap.isOpened():
    ret, frame = cap.read()  #capture a frame from live video
    ret, frame = caplight.read()

#     
    

    while True:
        ret, frame = cap.read() 
        ret, frameCapLight = caplight.read() 
        
        cv2.imshow("Frame", frame)
        cv2.imshow("Frame2", frameCapLight)
        key = cv2.waitKey(30)
        
        
        if key == 27: #key "esc"
            break

                

         #↑↑↑↑↑↑——————————Write Program Above——————————↑↑↑↑↑↑

    #print error if frame capturing was unsuccessful
    else:
        print("Error : Failed to capture frame")

# print error if the connection with camera is unsuccessful
else:
    print("Cannot open camera")



cap.release()
cv2.destroyAllWindows()





