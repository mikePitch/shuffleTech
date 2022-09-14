#import things
from ast import While
from glob import glob
from multiprocessing.connection import wait
import requests
import cv2
import numpy as np
import time
import pygame
import pyfirmata
import json

from _thread import *
from requests.structures import CaseInsensitiveDict


global shotCount


# PYGAME Setup

background_colour = (255,255,255)
table_colour = (202,164,116)
(width, height) = (1100, 240) #108
    

puckX = 300
puckY = 300



#Set Variables
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


# Mike
# cap = cv2.VideoCapture(1)

# Caf
cap = cv2.VideoCapture(0)

def findCornermarkers():
    print("Finding Table Corner Locations")
    tableCorners = [(0,0), (10,0), (0,10), (10,10)]
    ret, frame = cap.read()

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
        
def breakBeamLogic(a, b):
    global shotCount
    # print("Beam thread created")`1`
    ret, frameCapLight = caplight.read() #Captures Break Beam Camera
    roiLight = frameCapLight[530: 570,530: 720]
    blurLight = cv2.blur(roiLight,(1000,1000))
    average_color_row = np.average(blurLight, axis=0)
    average_color = np.average(average_color_row, axis=0)
    redInt = int(average_color[2])
    # cv2.imshow("frameligh", frameCapLight)
    
    # print(redInt)
    if redInt < 255:
        shotCount += 1 
        print("Shot Count: " + str(shotCount))
        time.sleep(0.5)
        

    # cv2.imshow("roiLight", roiLight)
    # cv2.imshow("blurLight", blurLight)
    

#————————————Start puck detection on s key—————————————————
def puckDetection(key, tick,GameScreen,tabCorners):
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
            if Blue > Red:
                BlueRounds += 1 
                time.sleep(1)
                print("BLUE WINS!!")
            else: 
                RedRounds += 1 
                time.sleep(1)
                print("RED WINS!!")      
            return 1
        # print("Game tick: " + str(tick))
        tick += 1
        slowDown = slowDown + 1
        # if key == 100: #key "d"
        #read frame
        ret, frame = cap.read()

        #refactor this ⬇︎⬇︎⬇︎⬇︎
        #co-ordinates in 
        #  of table corners
        pts1 = np.float32([topLeft,topRight,bottomLeft,bottomRight])
        #co-ordinates those points will be remapped to in flatFrame
        pts2 = np.float32([[tablePadding,tablePadding],[tablePadding + tableWidth,tablePadding],[tablePadding,tablePadding + tableLength],[tablePadding + tableWidth,tablePadding + tableLength]])


        #change perspective of frame
        M = cv2.getPerspectiveTransform(pts1,pts2)
        flatFrameClean = cv2.warpPerspective(frame,M,(tablePadding * 2 + tableWidth,tablePadding * 2 + tableLength))
        flatFrame = cv2.warpPerspective(frame,M,(tablePadding * 2 + tableWidth,tablePadding * 2 + tableLength))
        #refactor this ⬆︎⬆︎⬆︎⬆︎
    
        #———————————————Puck detection start————————————————————————

        # convert to hsv colorspace
        flatFrameHSV = cv2.cvtColor(flatFrame, cv2.COLOR_BGR2HSV)
        # find the colors within the boundaries
        roi = flatFrameHSV[0: 4500,0: 600]
    

        #——————————————Red Mask————————————————
        #set the lower and upper bounds for the red hue (red hsv wraps)
        # lower_red = np.array([0,160,160])
        # upper_red = np.array([10,255,255])

        # lower_red2 = np.array([170,160,160])
        # upper_red2 = np.array([180,255,255])
        
        
        lower_red = np.array([0,120,200])
        upper_red = np.array([10,255,255])

        lower_red2 = np.array([170,120,200])
        upper_red2 = np.array([180,255,255])


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

        # #——————————————Blue Mask————————————————     
        #set the lower and upper bounds for the blue hue (red hsv wraps)
        # lower_blue = np.array([100,80,100])
        # upper_blue = np.array([140,200,255])
        lower_blue = np.array([80,0,120])
        upper_blue = np.array([150,220,240])

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

        pygameLoop(pygameArrayRed,pygameArrayBlue ,GameScreen)

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
#——————————————End Of Puck Detection———————————————— 


def endOfRound(pygameArrayRed,pygameArrayBlue): 
    global iteration, sumOfPoints, passTrigger, passSumOfValues, killRound
    killRound = False
    arbitraryNumberOfGameTicks = 15
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
    
def pygameInit():
    print("Initialising Pygame")
    background_colour = (255,255,255)
    table_colour = (202,164,116)
    (width, height) = (1350, 200) #108
    puckX = 300
    puckY = 300
    
    screen = pygame.display.set_mode((width, height))
    pygame.display.set_caption('Shuffles')
    screen.fill(background_colour)
    
    pygame.draw.rect(screen, table_colour, pygame.Rect(0,10,1350,180))
    pygame.draw.circle(screen, (255,0,0),[puckX, puckY], 30, 0)
    pygame.display.flip()

    return screen

def pygameLoop(pygameArrayRed,pygameArrayBlue, screen):
    global shotCount
    tableImage = pygame.image.load('Assets/table.png')
    pygame.draw.rect(screen, (255,255,255), pygame.Rect(0,0,1350,200))
    pygame.draw.rect(screen, table_colour, pygame.Rect(0,10,1350,180))
    screen.blit(tableImage, (0,0))
    blueScore = 0
    RedScore = 0 
    
    bluePuckImage = pygame.image.load('Assets/BluePuck.png')
    redPuckImage = pygame.image.load('Assets/RedPuck.png')
    
    line5 = 165 * 0.3
    line4 = 524 * 0.3
    line3 = 1056 * 0.3
    line2 = 1768 * 0.3
    line1 = 2762 * 0.3
    for x in pygameArrayRed:
        xpos = x.split(",")[0]
        ypos = x.split(",")[1]
        drawX = 180 - float(xpos) * 0.3
        drawY = float(ypos) * 0.3

        if drawY < line5: 
            RedScore += 5
        elif drawY < line4:
            RedScore += 4
        elif drawY < line3:
            RedScore += 3
        elif drawY < line2:
            RedScore += 2
        elif drawY < line1:
            RedScore += 2
            
            # 2762
                
        # pygame.draw.circle(screen, (255,0,0),[int(drawY), int(drawX + 10)], 9, 0) 
        screen.blit(redPuckImage, (drawY,drawX))

        
        
    for x in pygameArrayBlue:
        xpos = x.split(",")[0]
        ypos = x.split(",")[1]
        drawX = 180 - float(xpos) * 0.3 
        drawY = float(ypos) * 0.3

        if drawY < line5: 
            blueScore += 5
        elif drawY < line4:
            blueScore += 4
        elif drawY < line3:
            blueScore += 3
        elif drawY < line2:
            blueScore += 2
        elif drawY < line1:
            blueScore += 1
            
        # pygame.draw.circle(screen, (0,0,255),[int(drawY ), int(drawX + 10)], 9, 0)     
        screen.blit(bluePuckImage, (drawY,drawX))
        
        
    
    
    # Line Drawing
    # pygame.draw.line(screen, (0,0,0), (line1,10),(line1,190), 1)
    # pygame.draw.line(screen, (0,0,0), (line2,10),(line2,190), 1)
    # pygame.draw.line(screen, (0,0,0), (line3,10),(line3,190), 1)
    # pygame.draw.line(screen, (0,0,0), (line4,10),(line4,190), 1)
    # pygame.draw.line(screen, (0,0,0), (line5,10),(line5,190), 1)
    

    font = pygame.font.SysFont(None, 24)
    blueScoreText = font.render('blueScore: ' +  str(blueScore), True, (0,0,0))
    screen.blit(blueScoreText, (900,20))
    redScoreText = font.render('redScore:' +  str(RedScore), True, (0,0,0))
    screen.blit(redScoreText, (900,50))
    blueScoreText = font.render('Turn Number:' + str(shotCount), True, (0,0,0))
    screen.blit(blueScoreText, (900,80))

    global Blue, Red
    Blue = blueScore
    Red = RedScore
    pygame.display.flip()
        
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
    board = pyfirmata.Arduino('/dev/cu.usbmodem1101')

    it = pyfirmata.util.Iterator(board)
    it.start()

    switchPin = board.digital[2]
    switchPin.mode = pyfirmata.INPUT
    
    time.sleep(1)
    
    
   
    

    while True:
        sw = switchPin.read()
        if sw is True:
            board.digital[13].write(1)
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

        else:
            board.digital[13].write(0)

    
        
def main(a):
    cap = cv2.VideoCapture(0)
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
    if cap.isOpened():
        ret, frame = cap.read()  #capture a frame from live video
        #check whether frame is successfully captured
        if ret:
            
            
                
            print("Success : Captured frame")
            flatFrame = frame
            pygame.init()
            while True:
                
                ret, frame = cap.read() 
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
                    
                    GameScreen = pygameInit()
                    tick = 0
                    round = 1 
                    while True:
                        shotCount = 0
                        print ("Round: " + str(round))
                        print("Red: " + str(RedRounds))
                        print("Blue: " + str (BlueRounds))
                        print("Shot Count: " + str(shotCount))
                        round = round + puckDetection(key, tick, GameScreen,tabCorners) 
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
                    
                    GameScreen = pygameInit()
                    tick = 0
                    round = 1 
                    while True:
                        shotCount = 0
                        print ("Round: " + str(round))
                        print("Red: " + str(RedRounds))
                        print("Blue: " + str (BlueRounds))
                        print("Shot Count: " + str(shotCount))
                        round = round + puckDetection(key, tick, GameScreen,tabCorners) 
                        
                        
                        url = "https://elatedtwist.backendless.app/api/data/table"
                        headers = CaseInsensitiveDict()
                        headers["Content-Type"] = "application/json"
                            
                        resp = requests.get(url, headers=headers)
                        
                        parsed = json.loads(resp.content)
                        
                        if str(parsed[0]['state']) == "0":
                            print("Going to Sleep")
                            cap.release()
                            cv2.destroyAllWindows()
                            pygame.quit()
                            sleepyMain()
            #↑↑↑↑↑↑——————————Write Program Above——————————↑↑↑↑↑↑

        #print error if frame capturing was unsuccessful
        else:
            print("Error : Failed to capture frame")
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
    

        

def menu():
    start = False
    print('1: Menu')
    print('2: Skip Main - Arduino Set Up')
    print('3: Enter Sleep State - Wait for startup')
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
        else:
            print("Not valid input")



menu()



cap.release()
cv2.destroyAllWindows()





# 1700,297
# 1644,810
# 578,451
# 566,575