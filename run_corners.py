import requests
import cv2
import numpy as np
import json
import depthai as dai
import datetime

from glob import glob
from multiprocessing.connection import wait
from _thread import *
from requests.structures import CaseInsensitiveDict

#----------------- Import our files -----------------#
import dim
import colour_cal
import findCornermarkers





#----------------- End Puck Detection Code -----------------#

    
def readPuckFile():
    puckLocationsFile = open("tableLocation.txt","r")
    tc = puckLocationsFile.readline()
    tabCorners = tc.split("-")
    return tabCorners
    

            
def main(a):
    
    #----------------- Read in the table corners -----------------#
    # Read in the table corners from tableLocations.txt    
    tabCorners = readPuckFile()

    topLeft = dim.topLeft = tuple(map(int, tabCorners[0].replace("(", "").replace(")", "").split(', ')))
    topRight = dim.topRight = tuple(map(int, tabCorners[1].replace("(", "").replace(")", "").split(', ')))
    bottomLeft = dim.bottomLeft = tuple(map(int, tabCorners[2].replace("(", "").replace(")", "").split(', ')))
    bottomRight = dim.bottomRight = tuple(map(int, tabCorners[3].replace("(", "").replace(")", "").split(', ')))

    cnrDict = {'TL': topLeft, 'TR': topRight, 'BL': bottomLeft, 'BR': bottomRight}

    pts1 = np.float32([cnrDict['TL'], cnrDict['TR'], cnrDict['BL'], cnrDict['BR']])
    #co-ordinates those points will be remapped to in flatFrame
    pts2 = np.float32([[dim.tablePadding, dim.tablePadding],
                            [dim.tablePadding + dim.tableWidth, dim.tablePadding],
                            [dim.tablePadding, dim.tablePadding + dim.tableLength],
                            [dim.tablePadding + dim.tableWidth, dim.tablePadding + dim.tableLength]])

    print(pts1)
    print(pts2)


    #----------------- OAK D Set up-----------------#
    # Create pipeline
    pipeline = dai.Pipeline()

    # Define source and output
    camRgb = pipeline.create(dai.node.ColorCamera)
    xoutVideo = pipeline.create(dai.node.XLinkOut)
    xoutVideo.setStreamName("video")

    # Properties
    camRgb.setBoardSocket(dai.CameraBoardSocket.RGB)
    camRgb.setResolution(dai.ColorCameraProperties.SensorResolution.THE_12_MP)

    controlIn = pipeline.createXLinkIn()
    controlIn.setStreamName('control')
    controlIn.out.link(camRgb.inputControl)



    # camRgb.setVideoSize(1280, 720)

    xoutVideo.input.setBlocking(False)
    xoutVideo.input.setQueueSize(1)

    # Linking
    camRgb.video.link(xoutVideo.input)
    # camRgb.setManualFocus(camRgb, 130)
    # HERE 
    cameraFound = False
    while not cameraFound:
        try:
            device = dai.Device(pipeline)
            video = device.getOutputQueue(name="video", maxSize=1, blocking=False)
            cameraFound = True
        except Exception as e:
            print("Camera Device error: " + str(e))


    dim.cameraSettings(device)

    #----------------- Run Puck Detection Code -----------------#



    
    while True:
        frame = video.get().getCvFrame() 
        
        cv2.imshow("Frame", frame)
        
        key = cv2.waitKey(30)
        

        if key == 97: #key "a"
            tabCorners = findCornermarkers.findCornermarkers(video)
        if key == 113: #key q
            tabCorners = [(1700,297), (1644,810), (578,451), (566,575)]
            print("Manual tab corners obtained")
        if key == 115: #key "s"
            #start Looking for pucks
            print("Saving corners...")
            tabCorners = readPuckFile()
        if key == 27: #key "esc"
            break

 

        #↑↑↑↑↑↑——————————Write Program Above——————————↑↑↑↑↑↑

    #print error if frame capturing was unsuccessful
    
    # print error if the connection with camera is unsuccessful
    else:
        print("Cannot open camera")

    
    



def menu():
    start = False
    print('1: Menu')
    print('2: Enter Colour Cal')
    while not start:
        i = input('Select Option (1-3): ')
        if i == '1':
            start = True
            main(0)
        elif i == '2':
            colour_cal.colorCal()
        else:
            print("Not valid input")



# main(0)
menu()
# cap.release()
cv2.destroyAllWindows()