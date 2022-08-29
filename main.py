#import things
from glob import glob
import requests
import cv2
import numpy as np
import time
import pygame

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

#Create an object to hold reference to camera video capturing
cap = cv2.VideoCapture(3)
caplight = cv2.VideoCapture(1)


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
    print('API Thread Running')
    url = "https://elatedtwist.backendless.app/api/data/PuckLocations"
    headers = CaseInsensitiveDict()
    headers["Content-Type"] = "application/json"
        
    blue = ",".join(centresBlue)
    red = ",".join(centresRed)
    
    blueJSON = '{"locations":[' + blue + ']}'
    redJSON = '{"locations":[' + red + ']}'

    data = '{"centresBlue1":' + blueJSON + ', "centresRed1": ' + redJSON + '}'

    resp = requests.post(url, headers=headers, data=data)
    return(resp)
        
def breakBeamLogic(a, b):
    global shotCount
    # print("Beam thread created")
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
        lower_red = np.array([0,160,160])
        upper_red = np.array([10,255,255])

        lower_red2 = np.array([170,160,160])
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
        lower_blue = np.array([100,80,100])
        upper_blue = np.array([140,200,255])

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
            
        # API THREAD                     
        try:
            if slowDown == 3:
                print("Attempting Thread")
                # thread1 = Thread(target = CallAPI())
                argss = (centresBlue,centresRed)
                start_new_thread(CallAPI,argss)
                slowDown = 0
        except Exception as e:
            print("An error occurred in the API thread: " + str(e))
            
        # BEAM DETECTION THREAD
        try: 
            # print("Attempting Beam Thread") 
            argss = ("BeamThread", "BeamMe")
            start_new_thread(breakBeamLogic,argss)
            slowDown = 0
        except Exception as e:
            print("An error occurred in the Beam thread: " + str(e))
        
        if key == 27:
            break
#——————————————End Of Puck Detection———————————————— 

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
    pygame.draw.rect(screen, (255,255,255), pygame.Rect(0,0,1350,200))
    pygame.draw.rect(screen, table_colour, pygame.Rect(0,10,1350,180))
    blueScore = 0
    RedScore = 0 
    
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
                
        pygame.draw.circle(screen, (255,0,0),[int(drawY), int(drawX + 10)], 9, 0) 
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
            
        pygame.draw.circle(screen, (0,0,255),[int(drawY ), int(drawX + 10)], 9, 0)     
    
    
    # Line Drawing
    pygame.draw.line(screen, (0,0,0), (line1,10),(line1,190), 1)
    pygame.draw.line(screen, (0,0,0), (line2,10),(line2,190), 1)
    pygame.draw.line(screen, (0,0,0), (line3,10),(line3,190), 1)
    pygame.draw.line(screen, (0,0,0), (line4,10),(line4,190), 1)
    pygame.draw.line(screen, (0,0,0), (line5,10),(line5,190), 1)
    

    font = pygame.font.SysFont(None, 24)
    blueScoreText = font.render('blueScore: ' +  str(blueScore), True, (0,0,0))
    screen.blit(blueScoreText, (900,20))
    redScoreText = font.render('redScore:' +  str(RedScore), True, (0,0,0))
    screen.blit(redScoreText, (900,50))
    blueScoreText = font.render('Turn Number:' + str(shotCount), True, (0,0,0))
    screen.blit(blueScoreText, (900,80))

    pygame.display.flip()
        
    print ("Blue Score: " + str(blueScore))
    print ("Red Score: " + str(RedScore))

    # font = pygame.font.SysFont(None, 24)
    # img = font.render('hello', True, (0,0,0))
    # screen.blit(img, (20, 20))
    
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
    

def main():
    global shotCount
    #check if connection with camera is successfully
    if cap.isOpened():
        ret, frame = cap.read()  #capture a frame from live video
        #check whether frame is successfully captured
        if ret:
            print("Success : Captured frame")
            flatFrame = frame
            pygame.init()
            while True:
                shotCount = 0
                ret, frame = cap.read() 
                ret, frameCapLight = caplight.read() 
                cv2.imshow("Frame", frame)
                cv2.imshow("Frame2", frameCapLight)
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
                    puckDetection(key, tick, GameScreen,tabCorners) 
                if key == 100: #key "d"
                    #send table corners to xano
                    print("d pressed")
                if key == 27: #key "esc"
                    break
            #↑↑↑↑↑↑——————————Write Program Above——————————↑↑↑↑↑↑

        #print error if frame capturing was unsuccessful
        else:
            print("Error : Failed to capture frame")
    # print error if the connection with camera is unsuccessful
    else:
        print("Cannot open camera")



main()
cap.release()
cv2.destroyAllWindows()





# 1700,297
# 1644,810
# 578,451
# 566,575