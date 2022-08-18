#import things
import requests
import cv2
import numpy as np

from threading import Thread
from _thread import *



import requests
from requests.structures import CaseInsensitiveDict
from requests.structures import CaseInsensitiveDict
import time

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
cap = cv2.VideoCapture(2)
caplight = cv2.VideoCapture(1)

#check if connection with camera is successfully
if cap.isOpened():
    ret, frame = cap.read()  #capture a frame from live video
    ret, frameCapLight = caplight.read()

    #check whether frame is successfully captured
    if ret:
        #print success if frame capturing was successful
        print("Success : Captured frame")

        #↓↓↓↓↓↓——————————Write Program In Below——————————↓↓↓↓↓↓

    
        flatFrame = frame

        def findCornermarkers():
            tableCorners = [(0,0), (10,0), (0,10), (10,10)]
            ret, frame = cap.read()

            frameBW = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            

            #detect markers
            arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
            arucoParams = cv2.aruco.DetectorParameters_create()
            (corners, ids, rejected) = cv2.aruco.detectMarkers(frameBW, arucoDict, parameters=arucoParams)

      
            if len(corners) == 4:
                print("All " + str(len(corners)) + " markers detected")
                print(ids)

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

                        

                # print("tl =", topLeft)
                # print("tr =", topRight)
                # print("bl =", bottomLeft)
                # print("br =", bottomRight)
               
                tableCorners = [topLeft, topRight, bottomLeft, bottomRight]

                
            else:
                print("Found " + str(len(corners)) + " markers")
                print(ids)
                
            return tableCorners



        #————————————Add 1 to throw number—————————————————

        def throwCounter(throwCnt):
            throwCount = throwCnt + 1
            print(throwCount)
            return throwCount

        def breakBeamLogic():
            roiLight = frameCapLight[530: 570,530: 720]
            print(1)
            blurLight = cv2.blur(roiLight,(1000,1000))
            print(2)
            average_color_row = np.average(blurLight, axis=0)
            print(3)
            average_color = np.average(average_color_row, axis=0)
            print(4)
            redInt = int(average_color[2])
            print(5)
            cv2.imshow("frameligh", frameCapLight)

            if redInt < 255:
                print("shot", redInt)
                time.sleep(0.5)
            print(redInt)

            cv2.imshow("roiLight", roiLight)
            cv2.imshow("blurLight", blurLight)

        def CallAPI(color, centresBlue, centresRed):
            print('now im alive')
            url = "https://elatedtwist.backendless.app/api/data/PuckLocations"
            headers = CaseInsensitiveDict()
            headers["Content-Type"] = "application/json"

            print(color)
            print(centresBlue)
            print(centresRed)

            blueString = ""
           
                
            blue = ",".join(centresBlue)
            red = ",".join(centresRed)


            blue = "[" + blue + "]"
            red = "[" + red + "]"

            

            blueJSON = '{"locations":' + blue + '}'
            redJSON = '{"locations":' + red + '}'


            


            data = '{"centresBlue1":' + blueJSON + ', "centresRed1": ' + redJSON + '}'
            print (data)

            resp = requests.post(url, headers=headers, data=data)
            print(resp.reason)
            print(resp)
            return(resp)


#————————————Start puck detection on s key—————————————————

        def puckDetection(key, tc):

            topLeft = tabCorners[0]
            topRight = tabCorners[1]
            bottomLeft = tabCorners[2]
            bottomRight = tabCorners[3]
            slowDown = 0
            while True:
                slowDown = slowDown + 1
                # if key == 100: #key "d"
                #read frame
                ret, frame = cap.read()



                #refactor this ⬇︎⬇︎⬇︎⬇︎
                #co-ordinates in frame of table corners
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
                        
                print("red puck centres = ", centresRed)
                
# {
# “table”: 1,
# “locations”:[
# {“puck”:[123,4323,1]},
# {“puck”:[123,4323,1]}
# ]}

                # #——————————————Blue Mask————————————————     
                #set the lower and upper bounds for the blue hue (red hsv wraps)
                lower_blue = np.array([100,80,100])
                upper_blue = np.array([140,200,255])

                #create a mask for blue colour using inRange function
                maskBlue = cv2.inRange(roi, lower_blue, upper_blue)
                contoursBlue, _ = cv2.findContours(maskBlue, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                centresBlue = []
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

                print("blue puck centres = ", centresBlue)
            
                #show Frame
                cv2.imshow("flatframe", flatFrameClean)
                cv2.imshow("puckframe", flatFrame)
                cv2.imshow("redMask", maskRed)
                cv2.imshow("blueMask", maskBlue)


                    #break loop
                key = cv2.waitKey(30)
                if key == 32:
                    tc = throwCounter(tc) 
                    
                    
                try:
                    if slowDown == 3:
                        print("Attempting Thread")
                        # thread1 = Thread(target = CallAPI())
                        argss = ("test", centresBlue,centresRed)
                        start_new_thread(CallAPI,argss)
                        slowDown = 0
                    
                except:
                    print("Error: unable to start thread")
                    
                try: 
                    print("Attempting Beam Thread") 
                    start_new_thread(breakBeamLogic())
                    slowDown = 0
                except:
                    print("Beam Thread Failed")
                if key == 27:
                    break


        #——————————————End Of Puck Detection————————————————     

        def sendCornerLocations():
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





        

        while True:
            ret, frame = cap.read() 
            
            cv2.imshow("Frame", frame)
            cv2.imshow("Frame2", frameCapLight)
            key = cv2.waitKey(30)
            
            throwCount = 0 
            if key == 97: #key "a"
                print("a pressed")
                tabCorners = findCornermarkers()
                


            if key == 115: #key "s"
                #start Looking for pucks
                print("Puck detection Initiallized")
                puckDetection(key, throwCount) 

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



cap.release()
cv2.destroyAllWindows()





