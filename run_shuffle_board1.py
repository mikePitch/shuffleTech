#import things
from ast import While
from glob import glob
from multiprocessing.connection import wait
import requests
import cv2
import numpy as np
import time
import pyfirmata
import json
import depthai as dai
import datetime

import dim
import colour_cal

from _thread import *
from requests.structures import CaseInsensitiveDict

#start_time = time.perf_counter()

def clamp(num, v0, v1):
    return max(v0, min(num, v1))


def findCornermarkers():
    print("Finding Table Corner Locations")
    tableCorners = [(0,0), (10,0), (0,10), (10,10)]
    frame = video.get().getCvFrame()

    frameBW = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    frameBW = cv2.bitwise_not(frameBW)
    
    #detect markers
    arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
    arucoParams = cv2.aruco.DetectorParameters_create()
    (corners, ids, rejected) = cv2.aruco.detectMarkers(frameBW, arucoDict, parameters=arucoParams)

    if len(corners) == 4:
        print("All " + str(len(corners)) + " markers detected")

        #Assign marker co-ordinates to correct corner

        for x in range (0,4):
            ppp = corners[x]
            pp = ppp[0]
            p = pp[0]
            pInt = (int(p[0]), int(p[1]))
            # print(pInt, ids[x])
            if ids[x] == 3:
                dim.topLeft = pInt
            elif ids[x] == 2:
                dim.topRight = pInt
            elif ids[x] == 1:
                dim.bottomLeft = pInt
            else:
                dim.bottomRight = pInt
        
        tableCorners = [dim.topLeft, dim.topRight, dim.bottomLeft, dim.bottomRight]
        tableCalibration(tableCorners)
        
    else:
        print("Found " + str(len(corners)) + " markers")
        print(ids)
        
    return tableCorners


def shotClock(shots):
    print('Shot count is f{shots}')


#————————————Start puck detection on s key—————————————————
def puckDetection_chris(cnrDict, pts1, pts2, video):


    
      
    while True:
        frame = video.get().getCvFrame()

        # Change perspective of frame - M is the transformation matirx
        M = cv2.getPerspectiveTransform(pts1,pts2)
        flatFrame = cv2.warpPerspective(frame, M, (dim.tablePadding * 2 + dim.tableWidth, dim.tablePadding * 2 + dim.tableLength))
        #———————————————Puck detection start————————————————————————

        # convert to hsv colorspace
        flatFrameHSV = cv2.cvtColor(flatFrame, cv2.COLOR_BGR2HSV)
        # find the colors within the boundaries
        roi = flatFrameHSV[0: 4500,0: 600]
    

        #——————————————Red Mask————————————————


        lower_red = np.array([75,0,0])
        upper_red = np.array([100,255,255])

        maskRed = cv2.inRange(roi, lower_red, upper_red)
        
        contoursRed, _ = cv2.findContours(maskRed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        centresRed = []            

        for cnt in contoursRed:

            # hull = cv2.convexHull(cnt)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt)
            
            if area > 400:
                cv2.drawContours(maskRed, [cnt], -1, (255,255, 255), -1)
                cv2.drawContours(flatFrame, [cnt], -1, (0, 255, 0), 2)
                # ellipse = cv2.fitEllipse(hull)
                # cv2.ellipse(frame,ellipse,(0,255,0),2)
                x, y, w, h = cv2.boundingRect(cnt)


        #red pucks white circles

        #findWhites
        lower_whites = np.array([0,0,0])
        upper_whites = np.array([180,255,135])

        #create a mask for white colour using inRange function
        maskWhite = cv2.inRange(roi, lower_whites, upper_whites)

        maskRedCenters = cv2.bitwise_and(maskWhite, maskRed)

        contoursRedCenters, _ = cv2.findContours(maskRedCenters, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        detections = []
        localRed = []
        for cnt2 in contoursRedCenters:
            # hull2 = cv2.convexHull(cnt2)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt2)
            if area > 80:
                cv2.drawContours(flatFrame, [cnt2], -1, (0, 255, 0), 2)
                # ellipse = cv2.fitEllipse(hull)
                # cv2.ellipse(frame,ellipse,(0,255,0),2)
                x, y, w, h = cv2.boundingRect(cnt2)
                detections.append([x, y, w, h])

                moments = cv2.moments(cnt2)
                appendString = '{"puck":' + str((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']), 1)) + '}'
                appendString = appendString.replace('(','[')
                appendString = appendString.replace(')',']')
                centresRed.append(appendString)
                
                localRed.append("[" + str(int(moments['m10']/moments['m00'])) + "," + str(int(moments['m01']/moments['m00'])) + "]")

        # #——————————————Blue Mask————————————————     
        #set the lower and upper bounds for the blue hue (red hsv wraps)
        # lower_blue = np.array([100,80,100])
        # upper_blue = np.array([140,200,255])
        lower_blue = np.array([5,0,0])
        upper_blue = np.array([39,255,255])

        #create a mask for blue colour using inRange function
        maskBlue = cv2.inRange(roi, lower_blue, upper_blue)
        contoursBlue, _ = cv2.findContours(maskBlue, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        centresBlue = []

        for cnt in contoursBlue:
            # hull = cv2.convexHull(cnt)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt)
            if area > 400:
                cv2.drawContours(maskBlue, [cnt], -1, (255,255, 255), -1)


        #find hole in blue mask
        #red pucks white circles

        #findWhites
        lower_whites = np.array([0,0,0])
        upper_whites = np.array([180,255,135])

        #create a mask for white colour using inRange function
        maskWhite = cv2.inRange(roi, lower_whites, upper_whites)

        maskBlueCenters = cv2.bitwise_and(maskWhite, maskBlue)

        contoursBlueCenters, _ = cv2.findContours(maskBlueCenters, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        detections = []
        localBlue = []
        for cnt2 in contoursBlueCenters:
            # hull2 = cv2.convexHull(cnt2)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt2)
            if area > 80:
                # cv2.drawContours(flatFrame, [hull2], -1, (0, 255, 0), 2)
                cv2.drawContours(flatFrame, [cnt2], -1, (0, 255, 0), 2)
                # ellipse = cv2.fitEllipse(hull)
                # cv2.ellipse(frame,ellipse,(0,255,0),2)
                # x, y, w, h = cv2.boundingRect(hull2)
                x, y, w, h = cv2.boundingRect(cnt2)
                detections.append([x, y, w, h])

                        # compute the center of the contour
                moments = cv2.moments(cnt2)
                appendString = '{"puck":' + str((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']) , 1)) + '}'

                appendString = appendString.replace('(','[')
                appendString = appendString.replace(')',']')
                centresBlue.append(appendString)
                
                localBlue.append("[" + str(int(moments['m10']/moments['m00'])) + "," + str(int(moments['m01']/moments['m00']))+ "]")


    
        #show actual mask not contours
        # maskBlue = cv2.inRange(roi, lower_blue, upper_blue)
        # maskRed = cv2.inRange(roi, lower_red, upper_red)
        # maskWhite = cv2.inRange(roi, lower_whites, upper_whites)
        # maskBlueCenters = cv2.bitwise_and(maskWhite, maskBlue)
        # maskRedCenters = cv2.bitwise_and(maskWhite, maskRed)

        # print(centresBlue)
        # print(centresRed)
        
        
        headers = CaseInsensitiveDict()
        headers["Content-Type"] = "application/json"
        data2 = '{"puckLocationsRed": [' + ",".join(localRed) +  '] ,"puckLocationsBlue": [' + ",".join(localBlue)+ ']}'
        # print(data2)
        
        
        resp = requests.put("http://localhost:3000/PuckLocations/1", headers=headers, data=data2)
        # print(resp.status_code)
        
        cv2.imshow("puckframe", flatFrame)
        cv2.imshow("redMask", maskRed)
        cv2.imshow("Red Centers", maskRedCenters)
        cv2.imshow("Blue Centers", maskBlueCenters)
        cv2.imshow("blueMask", maskBlue)


        key = cv2.waitKey(30)
        if key == ord('q'):
            break
        # except Exception as e:
        #         print("An error occurred in the Puck Detection function " + str(e))

#——————————————End Of Puck Detection————————————————

#————————————Start puck detection on s key—————————————————
def puckDetection(key, tick, tabCorners):
    

    print('Inside -> puckDetection <-')
        
    tabCorners[0] = tabCorners[0].replace("(", "")
    tabCorners[0] = tabCorners[0].replace(")", "")
    tabCorners[1] = tabCorners[1].replace("(", "")
    tabCorners[1] = tabCorners[1].replace(")", "")
    tabCorners[2] = tabCorners[2].replace("(", "")
    tabCorners[2] = tabCorners[2].replace(")", "")
    tabCorners[3] = tabCorners[3].replace("(", "")
    tabCorners[3] = tabCorners[3].replace(")", "")
    
    dim.topLeft = tuple(map(int, tabCorners[0].replace("(", "").replace(")", "").split(', ')))
    dim.topRight = tuple(map(int, tabCorners[1].replace("(", "").replace(")", "").split(', ')))
    dim.bottomLeft = tuple(map(int, tabCorners[2].replace("(", "").replace(")", "").split(', ')))
    dim.bottomRight = tuple(map(int, tabCorners[3].replace("(", "").replace(")", "").split(', ')))
  


    

    while True:

        frame = video.get().getCvFrame()

        #refactor this ⬇︎⬇︎⬇︎⬇︎
        #co-ordinates in 
        #  of table corners
        pts1 = np.float32([dim.topLeft,dim.topRight,dim.bottomLeft,dim.bottomRight])
        #co-ordinates those points will be remapped to in flatFrame
        pts2 = np.float32([[dim.tablePadding,dim.tablePadding],
                            [dim.tablePadding + dim.tableWidth, dim.tablePadding],
                            [dim.tablePadding, dim.tablePadding + dim.tableLength],
                            [dim.tablePadding + dim.tableWidth, dim.tablePadding + dim.tableLength]])


        #change perspective of frame
        M = cv2.getPerspectiveTransform(pts1,pts2)
        flatFrameClean = cv2.warpPerspective(frame,M,(dim.tablePadding * 2 + dim.tableWidth, dim.tablePadding * 2 + dim.tableLength))
        flatFrame = cv2.warpPerspective(frame,M,(dim.tablePadding * 2 + dim.tableWidth, dim.tablePadding * 2 + dim.tableLength))
        #refactor this ⬆︎⬆︎⬆︎⬆︎
    
        #———————————————Puck detection start————————————————————————

        # convert to hsv colorspace
        flatFrameHSV = cv2.cvtColor(flatFrame, cv2.COLOR_BGR2HSV)
        # find the colors within the boundaries
        roi = flatFrameHSV[0: 4500,0: 600]
    

        #——————————————Red Mask————————————————


        lower_red = np.array([75,0,0])
        upper_red = np.array([100,255,255])

        maskRed = cv2.inRange(roi, lower_red, upper_red)
        
        contoursRed, _ = cv2.findContours(maskRed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        centresRed = []            

        for cnt in contoursRed:

            # hull = cv2.convexHull(cnt)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt)
            
            if area > 400:
                cv2.drawContours(maskRed, [cnt], -1, (255,255, 255), -1)
                cv2.drawContours(flatFrame, [cnt], -1, (0, 255, 0), 2)
                # ellipse = cv2.fitEllipse(hull)
                # cv2.ellipse(frame,ellipse,(0,255,0),2)
                x, y, w, h = cv2.boundingRect(cnt)


        #red pucks white circles

        #findWhites
        lower_whites = np.array([0,0,0])
        upper_whites = np.array([180,255,135])

        #create a mask for white colour using inRange function
        maskWhite = cv2.inRange(roi, lower_whites, upper_whites)

        maskRedCenters = cv2.bitwise_and(maskWhite, maskRed)

        contoursRedCenters, _ = cv2.findContours(maskRedCenters, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        detections = []
        localRed = []
        for cnt2 in contoursRedCenters:
            # hull2 = cv2.convexHull(cnt2)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt2)
            if area > 80:
                cv2.drawContours(flatFrame, [cnt2], -1, (0, 255, 0), 2)
                # ellipse = cv2.fitEllipse(hull)
                # cv2.ellipse(frame,ellipse,(0,255,0),2)
                x, y, w, h = cv2.boundingRect(cnt2)
                detections.append([x, y, w, h])

                moments = cv2.moments(cnt2)
                appendString = '{"puck":' + str((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']), 1)) + '}'
                appendString = appendString.replace('(','[')
                appendString = appendString.replace(')',']')
                centresRed.append(appendString)
                
                localRed.append("[" + str(int(moments['m10']/moments['m00'])) + "," + str(int(moments['m01']/moments['m00'])) + "]")

        # #——————————————Blue Mask————————————————     
        #set the lower and upper bounds for the blue hue (red hsv wraps)
        # lower_blue = np.array([100,80,100])
        # upper_blue = np.array([140,200,255])
        lower_blue = np.array([5,0,0])
        upper_blue = np.array([39,255,255])

        #create a mask for blue colour using inRange function
        maskBlue = cv2.inRange(roi, lower_blue, upper_blue)
        contoursBlue, _ = cv2.findContours(maskBlue, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        centresBlue = []

        for cnt in contoursBlue:
            # hull = cv2.convexHull(cnt)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt)
            if area > 400:
                cv2.drawContours(maskBlue, [cnt], -1, (255,255, 255), -1)


        #find hole in blue mask
        #red pucks white circles

        #findWhites
        lower_whites = np.array([0,0,0])
        upper_whites = np.array([180,255,135])

        #create a mask for white colour using inRange function
        maskWhite = cv2.inRange(roi, lower_whites, upper_whites)

        maskBlueCenters = cv2.bitwise_and(maskWhite, maskBlue)

        contoursBlueCenters, _ = cv2.findContours(maskBlueCenters, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        detections = []
        localBlue = []
        for cnt2 in contoursBlueCenters:
            # hull2 = cv2.convexHull(cnt2)
            # Calculate area and remove small elements
            area = cv2.contourArea(cnt2)
            if area > 80:
                # cv2.drawContours(flatFrame, [hull2], -1, (0, 255, 0), 2)
                cv2.drawContours(flatFrame, [cnt2], -1, (0, 255, 0), 2)
                # ellipse = cv2.fitEllipse(hull)
                # cv2.ellipse(frame,ellipse,(0,255,0),2)
                # x, y, w, h = cv2.boundingRect(hull2)
                x, y, w, h = cv2.boundingRect(cnt2)
                detections.append([x, y, w, h])

                        # compute the center of the contour
                moments = cv2.moments(cnt2)
                appendString = '{"puck":' + str((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']) , 1)) + '}'

                appendString = appendString.replace('(','[')
                appendString = appendString.replace(')',']')
                centresBlue.append(appendString)
                
                localBlue.append("[" + str(int(moments['m10']/moments['m00'])) + "," + str(int(moments['m01']/moments['m00']))+ "]")


    
        #show actual mask not contours
        # maskBlue = cv2.inRange(roi, lower_blue, upper_blue)
        # maskRed = cv2.inRange(roi, lower_red, upper_red)
        # maskWhite = cv2.inRange(roi, lower_whites, upper_whites)
        # maskBlueCenters = cv2.bitwise_and(maskWhite, maskBlue)
        # maskRedCenters = cv2.bitwise_and(maskWhite, maskRed)

        # print(centresBlue)
        # print(centresRed)
        
        
        headers = CaseInsensitiveDict()
        headers["Content-Type"] = "application/json"
        data2 = '{"puckLocationsRed": [' + ",".join(localRed) +  '] ,"puckLocationsBlue": [' + ",".join(localBlue)+ ']}'
        # print(data2)
        
        
        resp = requests.put("http://localhost:3000/PuckLocations/1", headers=headers, data=data2)
        # print(resp.status_code)
        
        cv2.imshow("flatframe", flatFrameClean)
        cv2.imshow("puckframe", flatFrame)
        cv2.imshow("redMask", maskRed)
        cv2.imshow("Red Centers", maskRedCenters)
        cv2.imshow("Blue Centers", maskBlueCenters)
        cv2.imshow("blueMask", maskBlue)

            #break loop
        key = cv2.waitKey(30)
        if key == ord('q'):
            break
        # except Exception as e:
        #         print("An error occurred in the Puck Detection function " + str(e))

#——————————————End Of Puck Detection———————————————— 


def tableCalibration(tableCorners):
    puckLocationsFile = open("tableLocation.txt","w")
    tc = '-'.join(str(v) for v in tableCorners)
    puckLocationsFile.write(tc)
    puckLocationsFile.close()
    
def readPuckFile():
    puckLocationsFile = open("tableLocation.txt","r")
    tc = puckLocationsFile.readline()
    tabCorners = tc.split("-")
    return tabCorners
    
def arduino_switch(aa,a):

    print("Successfully entered arduino thread")

    #global shotCount
    #shotCount = 0
    
    #board = pyfirmata.Arduino('/dev/cu.usbmodem14501')     # Other
    #board = pyfirmata.Arduino('/dev/cu.usbmodem101')        # Top
    board = pyfirmata.Arduino('/dev/cu.usbmodem1101')     # Bottom

    
    it = pyfirmata.util.Iterator(board)
    it.start()

    switchPin = board.digital[2]
    switchPin.mode = pyfirmata.INPUT
    
    time.sleep(1)
    print('ARDUNIO READY TO ACCEPT PUCKS')


    while True:
 
        sw = switchPin.read()
        
        if sw is True:

            shotCount += 1

            headers = CaseInsensitiveDict()
            headers["Content-Type"] = "application/json"
            data3 = '{"PythonShotCounter":' + str(shotCount) + '}'
            #print(data3)
            
            
            # TODO : Wrap this if error
            resp = requests.patch("http://localhost:3000/TableData/1", headers=headers, data=data3)
            #print(resp.status_code)

            print('Shot Number: ' + str(shotCount))


            time.sleep(0.1)
            
            # TODO : Include CV solution to detect throw as well. hands on sensor

            
def main(a):
    
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


    #-----------------oakd Set up-----------------
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

    

    # Test Arduino Thread
    try:
        argss = (0, 0)
        start_new_thread(arduino_switch,argss) 
        print('why')
    except Exception as e:
        print("An error occurred in the Arduino thread: " + str(e))

    #puckDetection_chris(cnrDict, pts1, pts2, video)

    '''
    while True:
        frame = video.get().getCvFrame() 
        
        cv2.imshow("Frame", frame)
        
        key = cv2.waitKey(30)
        
        print('Inside -> main While loop <-')
        
    
        if key == 97: #key "a"
            tabCorners = findCornermarkers()
        if key == 113: #key q
            tabCorners = [(1700,297), (1644,810), (578,451), (566,575)]
            print("Manual tab corners obtained")
        # if key == 115: #key "s"
        #     #start Looking for pucks
        print("Puck detection Initiallized")
        #tabCorners = readPuckFile()
    

        
        tick = 0
        round = 1 
        print("Shot Count: " + str(shotCount))
        round = round + puckDetection(key, tick, tabCorners) 
        
    
        while True:
            shotCount = 0
            # print ("Round: " + str(round))
            # print("Red: " + str(RedRounds))
            # print("Blue: " + str (BlueRounds))
            print("Shot Count: " + str(shotCount))
            round = round + puckDetection(key, tick,tabCorners) 
            time.sleep(1)
     
        if key == 100: #key "d"
            #send table corners to xano
            print("d pressed")
        if key == 27: #key "esc"
            break
        
        if a == 1: 
            #start Looking for pucks
            print("Puck detection Initiallized")
            tabCorners = readPuckFile()
            
            tick = 0
            round = 1 
            while True:
                shotCount = 0
                print ("Round: " + str(round))
                # print("Red: " + str(RedRounds))
                # print("Blue: " + str (BlueRounds))
                print("Shot Count: " + str(shotCount))
                round = round + puckDetection(key, tick,tabCorners) 
          
                    

        #↑↑↑↑↑↑——————————Write Program Above——————————↑↑↑↑↑↑

    #print error if frame capturing was unsuccessful
    
    # print error if the connection with camera is unsuccessful
    else:
        print("Cannot open camera")
    '''

    
    



def menu():
    start = False
    print('1: Menu')
    print('2: Skip Main - Arduino Set Up')
    print('3: Enter Colour Cal')
    while not start:
        i = input('Select Option (1-3): ')
        if i == '1':
            start = True
            main(0)
        elif i == '2': 
            start = True
            arduino_switch(0,0)
        elif i == '3':
            colour_cal.colorCal()
        else:
            print("Not valid input")



main(0)
#menu()
# cap.release()
cv2.destroyAllWindows()