#import things
from ast import While
from glob import glob
from multiprocessing.connection import wait
import requests
import cv2
import numpy as np
import time
# import pygame
import pyfirmata
import json
import depthai as dai


from _thread import *
from requests.structures import CaseInsensitiveDict


global shotCount

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

# Connect to device and start pipeline
with dai.Device(pipeline) as device:
    controlQueue = device.getInputQueue('control')
    # controlQueue = device.tryGetAll()

  
    ctrl = dai.CameraControl()
    ctrl.setManualFocus(42)
    controlQueue.send(ctrl)
    

    ctrl = dai.CameraControl()
    ctrl.setManualExposure(21500, 200)
    controlQueue.send(ctrl)
  
    video = device.getOutputQueue(name="video", maxSize=1, blocking=False)

    # PYGAME Setup

    background_colour = (255,255,255)
    table_colour = (202,164,116)
    (width, height) = (1100, 240) #108
        

    puckX = 300
    puckY = 300

    #Set Variables
    #dimensions of table in mm
    tableWidth = 600
    tableLength = 3462
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


    # Mike
    # cap = cv2.VideoCapture(2)

    # Caf
    # cap = cv2.VideoCapture(0)

    def findCornermarkers():
        print("Finding Table Corner Locations")
        tableCorners = [(0,0), (10,0), (0,10), (10,10)]
        frame = video.get().getCvFrame()

        frameBW = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
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
                    topLeft = pInt
                elif ids[x] == 2:
                    topRight = pInt
                elif ids[x] == 1:
                    bottomLeft = pInt
                else:
                    bottomRight = pInt
            
            tableCorners = [topLeft, topRight, bottomLeft, bottomRight]
            tableCalibration(tableCorners)
            
        else:
            print("Found " + str(len(corners)) + " markers")
            print(ids)
            
        return tableCorners


    def CallAPI(centresBlue, centresRed):
        # print('API Thread Running')
        url = "https://elatedtwist.backendless.app/api/data/PuckLocations"
        headers = CaseInsensitiveDict()
        headers["Content-Type"] = "application/json"
            
        blue = ",".join(centresBlue)
        red = ",".join(centresRed)
        
        blueJSON = '{"locations":[' + blue + ']}'
        redJSON = '{"locations":[' + red + ']}'

        data = '{"TableID": 1, "centresBlue1":' + blueJSON + ', "centresRed1": ' + redJSON + '}'

        resp = requests.post(url, headers=headers, data=data)
        return(resp)
            

        

    #????????????????????????????????????Start puck detection on s key???????????????????????????????????????????????????
    def puckDetection(key, tick,tabCorners):
        # End of round variables
        global iteration, sumOfPoints, passTrigger, killRound, BlueScore, RedScore, BlueRounds, RedRounds
        iteration = 0
        passTrigger = 0 
        sumOfPoints = 0
        killRound = False 
        
        tabCorners[0] = tabCorners[0].replace("(", "")
        tabCorners[0] = tabCorners[0].replace(")", "")
        tabCorners[1] = tabCorners[1].replace("(", "")
        tabCorners[1] = tabCorners[1].replace(")", "")
        tabCorners[2] = tabCorners[2].replace("(", "")
        tabCorners[2] = tabCorners[2].replace(")", "")
        tabCorners[3] = tabCorners[3].replace("(", "")
        tabCorners[3] = tabCorners[3].replace(")", "")
        
        topLeft = tuple(map(int, tabCorners[0].split(', ')))
        topRight = tuple(map(int, tabCorners[1].split(', ')))
        bottomLeft = tuple(map(int, tabCorners[2].split(', ')))
        bottomRight = tuple(map(int, tabCorners[3].split(', ')))
        slowDown = 0
        while True:
            if killRound:  
                return 1
            # print("Game tick: " + str(tick))
            tick += 1
            slowDown = slowDown + 1
            # if key == 100: #key "d"
            #read frame
            frame = video.get().getCvFrame()

            #refactor this ????????????????????????
            #co-ordinates in 
            #  of table corners
            pts1 = np.float32([topLeft,topRight,bottomLeft,bottomRight])
            #co-ordinates those points will be remapped to in flatFrame
            pts2 = np.float32([[tablePadding,tablePadding],[tablePadding + tableWidth,tablePadding],[tablePadding,tablePadding + tableLength],[tablePadding + tableWidth,tablePadding + tableLength]])


            #change perspective of frame
            M = cv2.getPerspectiveTransform(pts1,pts2)
            flatFrameClean = cv2.warpPerspective(frame,M,(tablePadding * 2 + tableWidth,tablePadding * 2 + tableLength))
            flatFrame = cv2.warpPerspective(frame,M,(tablePadding * 2 + tableWidth,tablePadding * 2 + tableLength))
            #refactor this ????????????????????????
        
            #?????????????????????????????????????????????Puck detection start????????????????????????????????????????????????????????????????????????

            # convert to hsv colorspace
            flatFrameHSV = cv2.cvtColor(flatFrame, cv2.COLOR_BGR2HSV)
            # find the colors within the boundaries
            roi = flatFrameHSV[0: 4500,0: 600]
        

            #??????????????????????????????????????????Red Mask????????????????????????????????????????????????
            #set the lower and upper bounds for the red hue (red hsv wraps)
            # lower_red = np.array([0,160,160])
            # upper_red = np.array([10,255,255])

            # lower_red2 = np.array([170,160,160])
            # upper_red2 = np.array([180,255,255])
            
            
            lower_red = np.array([0,100,150])
            upper_red = np.array([5,200,255])

            lower_red2 = np.array([160,60,120])
            upper_red2 = np.array([180,200,255])


            #create a mask for red colour using inRange function
            redMask2 = cv2.inRange(roi, lower_red2, upper_red2)
            redMask1 = cv2.inRange(roi, lower_red, upper_red)
            maskRed = redMask1 | redMask2
            
            contoursRed, _ = cv2.findContours(maskRed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            centresRed = []
            detectionsRed = []
            pygameArrayRed = []
            
            for cnt in contoursRed:

                hull = cv2.convexHull(cnt)
                # Calculate area and remove small elements
                area = cv2.contourArea(cnt)
                
                if area > 700:
                    cv2.drawContours(maskRed, [hull], -1, (255,255, 255), -1)
                    cv2.drawContours(flatFrame, [hull], -1, (0, 255, 0), 2)
                    # ellipse = cv2.fitEllipse(hull)
                    # cv2.ellipse(frame,ellipse,(0,255,0),2)
                    x, y, w, h = cv2.boundingRect(hull)

                    moments = cv2.moments(cnt)
                    appendString = '{"puck":' + str((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']), 1)) + '}'
                    appendString = appendString.replace('(','[')
                    appendString = appendString.replace(')',']')
                    centresRed.append(appendString)

                    pygameArrayRedString = str(int(moments['m10']/moments['m00'])) + ","+ str(int(moments['m01']/moments['m00']))
                    pygameArrayRed.append(pygameArrayRedString)

            # #??????????????????????????????????????????Blue Mask????????????????????????????????????????????????     
            #set the lower and upper bounds for the blue hue (red hsv wraps)
            # lower_blue = np.array([100,80,100])
            # upper_blue = np.array([140,200,255])
            lower_blue = np.array([90,100,120])
            upper_blue = np.array([120,250,250])

            #create a mask for blue colour using inRange function
            maskBlue = cv2.inRange(roi, lower_blue, upper_blue)
            contoursBlue, _ = cv2.findContours(maskBlue, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            centresBlue = []
            pygameArrayBlue = []
            for cnt in contoursBlue:
                hull = cv2.convexHull(cnt)
                # Calculate area and remove small elements
                area = cv2.contourArea(cnt)
                if area > 700:
                    cv2.drawContours(maskBlue, [hull], -1, (255,255, 255), -1)

                                    # compute the center of the contour
                    # moments = cv2.moments(cnt)
                    # centresBlue.append((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00'])))
                    moments = cv2.moments(cnt)
                    appendString = '{"puck":' + str((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00']) , 1)) + '}'
                    appendString = appendString.replace('(','[')
                    appendString = appendString.replace(')',']')
                    centresBlue.append(appendString)
                    pygameArrayBlueString = str(int(moments['m10']/moments['m00'])) + ","+ str(int(moments['m01']/moments['m00']))
                    pygameArrayBlue.append(pygameArrayBlueString)
        
            #show Frame
            cv2.imshow("flatframe", flatFrameClean)
            cv2.imshow("puckframe", flatFrame)
            cv2.imshow("redMask", maskRed)
            cv2.imshow("blueMask", maskBlue)

                #break loop
            key = cv2.waitKey(30)
            
            if shotCount >= 8:
                # End of round thread                     
                try:
                    print("Attempting End of round Thread")
                    argss = (pygameArrayRed,pygameArrayBlue)
                    start_new_thread(endOfRound,argss)
                
                except Exception as e:
                    print("An error occurred in the end of round thread: " + str(e))
                
            # API THREAD                     
            try:
                # if slowDown == 3:
                # print("Attempting Thread")
                # thread1 = Thread(target = CallAPI())
                argss = (centresBlue,centresRed)
                start_new_thread(CallAPI,argss)
                slowDown = 0
            except Exception as e:
                print("An error occurred in the API thread: " + str(e))
                
            # BEAM DETECTION THREAD 
            # NO LONGER IN USE
            # try: 
            #     # print("Attempting Beam Thread") 
            #     argss = ("BeamThread", "BeamMe")
            #     start_new_thread(breakBeamLogic,argss)
            #     slowDown = 0
            # except Exception as e:
            #     print("An error occurred in the Beam thread: " + str(e))
            
            if key == 27:
                break
    #??????????????????????????????????????????End Of Puck Detection???????????????????????????????????????????????? 


    def endOfRound(pygameArrayRed,pygameArrayBlue): 
        global iteration, sumOfPoints, passTrigger, passSumOfValues, killRound
        killRound = False
        arbitraryNumberOfGameTicks = 5
        # if the sumOfPoints doesn't change (+-10 for X amount of frames the round is deemed to be finished)
        
        if passTrigger == 0:
            passSumOfValues = sumOfPoints
            
        sumOfPoints = 0
        
        for x in pygameArrayRed:
            xpos = x.split(",")[0]
            ypos = x.split(",")[1]
            sumOfPoints = sumOfPoints + int(xpos) + int(ypos)
        
        for x in pygameArrayBlue:
            xpos = x.split(",")[0]
            ypos = x.split(",")[1]
            sumOfPoints = sumOfPoints + int(xpos) + int(ypos)
        
        print("Sum of points this tick: " + str(sumOfPoints))
        print("Desired sum of game ticks: " + str(passSumOfValues))
        
        # checks if the sum is within the +-10 range
        if (passSumOfValues - 10) <= sumOfPoints <= (passSumOfValues + 10):
            print("No Movement Detected. Tick: " + str(passTrigger) )
            passTrigger += 1
            if passTrigger >= arbitraryNumberOfGameTicks: 
                # Success the pucks have stopped
                
                killRound = True 
        else: 
            passTrigger = 0 
            print("Pucks still moving mate")
        

    def sendCornerLocations(tabCorners):
        print(tabCorners[0])

        topLeft = str(tabCorners[0])
        topRight = str(tabCorners[1])
        bottomLeft = str(tabCorners[2])
        bottomRight = str(tabCorners[3])

        url = 'https://xqmp-ydra-x0sy.a2.xano.io/api:0WTzvDfT/getCoods'
        myobj = {'topLeft': topLeft,'topRight': topRight, 'bottomLeft': bottomLeft, 'bottomRight': bottomRight}

        x = requests.post(url, json = myobj)
        print(x)

        print("sendCornerLocations() run")  
    
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
        global shotCount
        shotCount = 0
        print("Successfully entered arduino thread")
        board = pyfirmata.Arduino('/dev/cu.usbmodem14401')

        it = pyfirmata.util.Iterator(board)
        it.start()

        switchPin = board.digital[2]
        switchPin.mode = pyfirmata.INPUT
        
        time.sleep(1)

        while True:
            sw = switchPin.read()
            if sw is True:
                # board.digital[13].write(1)
                shotCount += 1
                print('Shot Number: ' + str(shotCount))
                url = "https://elatedtwist.backendless.app/api/services/Game/shotPlayed"
                headers = CaseInsensitiveDict()
                headers["Content-Type"] = "application/json"
                d = "3D25FC35-B227-4157-B084-B701A48E1DF7"   
                o = requests.post(url, headers=headers,data=d)
                print(o.status_code)

                while True:
                    sw = switchPin.read()
                    if sw is False:
                        break
            # else:
            #     board.digital[13].write(0)

        
            
    def main(a):
        # cap = cv2.VideoCapture(0)
        global shotCount, RedRounds, BlueRounds
        shotCount = 0
        RedRounds = 0
        BlueRounds = 0
        # Arduino Thread
        try:
            print("Attempting Arduino Thread")
            # print ("attempting to enter turn thread")
            argss = (0, 0)
            start_new_thread(arduino_switch,argss) 
        except Exception as e:
            print("An error occurred in the Arduino thread: " + str(e))
            
        #check if connection with camera is successfully
        if True:
            frame = video.get().getCvFrame()  #capture a frame from live video
            #check whether frame is successfully captured
            
                
                
                
            print("Success : Captured frame")
            flatFrame = frame
            while True:
                frame = video.get().getCvFrame() 
                # ret, frameCapLight = caplight.read() 
                cv2.imshow("Frame", frame)
                # cv2.imshow("Frame2", frameCapLight)
                key = cv2.waitKey(30)
                if key == 97: #key "a"
                    tabCorners = findCornermarkers()
                if key == 113: #key q
                    tabCorners = [(1700,297), (1644,810), (578,451), (566,575)]
                    print("Manual tab corners obtained")
                if key == 115: #key "s"
                    #start Looking for pucks
                    print("Puck detection Initiallized")
                    tabCorners = readPuckFile()
                    
                    tick = 0
                    round = 1 
                    while True:
                        shotCount = 0
                        print ("Round: " + str(round))
                        print("Red: " + str(RedRounds))
                        print("Blue: " + str (BlueRounds))
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
                        print("Red: " + str(RedRounds))
                        print("Blue: " + str (BlueRounds))
                        print("Shot Count: " + str(shotCount))
                        round = round + puckDetection(key, tick,tabCorners) 
                        
                        
                        url = "https://elatedtwist.backendless.app/api/data/table"
                        headers = CaseInsensitiveDict()
                        headers["Content-Type"] = "application/json"
                            
                        resp = requests.get(url, headers=headers)
                        
                        parsed = json.loads(resp.content)
                        
                        if str(parsed[0]['state']) == "0":
                            print("Going to Sleep")
                            # cap.release()
                            cv2.destroyAllWindows()
                            sleepyMain()
            #????????????????????????????????????????????????Write Program Above????????????????????????????????????????????????

        #print error if frame capturing was unsuccessful
       
        # print error if the connection with camera is unsuccessful
        else:
            print("Cannot open camera")
            
            
    def sleepyMain():
        sleep = True
        while sleep:
            print("Waiting for Backendless to wake me up")
            
            url = "https://elatedtwist.backendless.app/api/data/table"
            headers = CaseInsensitiveDict()
            headers["Content-Type"] = "application/json"
                
            resp = requests.get(url, headers=headers)
            
            parsed = json.loads(resp.content)
            
            if str(parsed[0]['state']) == "1":
                sleep = False
                print("Table: " + str(parsed[0]['tableNumber']) + " has awoken.")
                
                main(1)
            else: 
                print('zzzzzz')
                time.sleep(2)
        
        
    def colorCal():
        # Read an image
        ccFrame = video.get().getCvFrame()
        
        def clickPoint(event, x, y, flags, param):
            if event == cv2.EVENT_LBUTTONUP :  # checks mouse click
                colorsHSV = image[y, x]
            
                print("HSV Value at ({},{}):{} ".format(x,y,colorsHSV))
                print(colorsHSV)
                print("")
        
        cv2.namedWindow('Select_Puck_Colour')
        cv2.setMouseCallback('Select_Puck_Colour', clickPoint)

        if True:
            #check whether frame is successfully captured
            if True:      
                print("Success : Captured frame")
                flatFrame = ccFrame
                while True:
                    cv2.imshow('Select_Puck_Colour', ccFrame)
                    ccvHSV = cv2.cvtColor(ccFrame, cv2.COLOR_BGR2HSV)
                    
                    ccFrame = video.get().getCvFrame() 
                    image = ccvHSV
                    # ret, frameCapLight = caplight.read() 
                    if cv2.waitKey(10) & 0xFF == 32:
                        break

                    if cv2.waitKey(10) & 0xFF == 27:
                        break
                    
                    # cv2.imshow("Frame", ccFrame)
                    # cv2.imshow("Frame2", frameCapLight)
                    key = cv2.waitKey(30)
                    
                    if key == 27: #key "esc"
                        break
                
        # if esc is pressed, close all windows.
        cv2.destroyAllWindows()
        
    
                    


        
        
    
        


            

    def menu():
        start = False
        print('1: Menu')
        print('2: Skip Main - Arduino Set Up')
        print('3: Enter Sleep State - Wait for startup')
        print('4: Enter Colour Cal')
        while not start:
            i = input('Select Option (1-3): ')
            if i == '1':
                start = True
                main(0)
            elif i == '2': 
                start = True
                arduino_switch(0,0)
            elif i == '3':
                sleepyMain()
            elif i == '4':
                colorCal()

            else:
                print("Not valid input")



    menu()
    # cap.release()
    cv2.destroyAllWindows()