#import things
import requests
import cv2
import numpy as np

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

#Corners of table
topLeft = [511,54]
topRight = [737,51]
bottomLeft = [426,711]
bottomRight = [872,695]

#Create an object to hold reference to camera video capturing
cap = cv2.VideoCapture("shuffle_video.mpeg")

#check if connection with camera is successfully
if cap.isOpened():
    ret, frame = cap.read()  #capture a frame from live video

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
            cv2.imshow("FrameBW", frameBW)

            #detect markers
            arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
            arucoParams = cv2.aruco.DetectorParameters_create()
            (corners, ids, rejected) = cv2.aruco.detectMarkers(frameBW, arucoDict, parameters=arucoParams)

      
            if len(corners) == 4:
                print("All " + str(len(corners)) + " markers detected")
                print(corners)

                #Assign marker co-ordinates to correct corner

                for x in range (0,4):
                    ppp = corners[x]
                    pp = ppp[0]
                    p = pp[0]
                    pInt = (int(p[0]), int(p[1]))
                    print(pInt, ids[x])
                    if ids[x] == 0:
                        topLeft = pInt
                    elif ids[x] == 1:
                        topRight = pInt
                    elif ids[x] == 2:
                        bottomLeft = pInt
                    else:
                        bottomRight = pInt

                print("tl =", topLeft)
                print("tr =", topRight)
                print("bl =", bottomLeft)
                print("br =", bottomRight)
                    
                #co-ordinates in frame of table corners
                pts1 = np.float32([topLeft,topRight,bottomLeft,bottomRight])
                #co-ordinates those points will be remapped to in flatFrame
                pts2 = np.float32([[tablePadding,tablePadding],[tablePadding + tableWidth,tablePadding],[tablePadding,tablePadding + tableLength],[tablePadding + tableWidth,tablePadding + tableLength]])


                #change perspective of frame
                M = cv2.getPerspectiveTransform(pts1,pts2)
                flatFrame = cv2.warpPerspective(frame,M,(tablePadding * 2 + tableWidth,tablePadding * 2 + tableLength))

                tableCorners = [topLeft, topRight, bottomLeft, bottomRight]

                
            else:
                print("Found " + str(len(corners)) + " markers")
                flatFrame = frame
                cv2.putText(flatFrame, str("Couldn't flatten frame: Found " + str(len(corners)) + " markers"), (120, 120), cv2.FONT_HERSHEY_DUPLEX, .6, (0, 0, 0), 4)
                cv2.putText(flatFrame, str("Couldn't flatten frame: Found " + str(len(corners)) + " markers"), (120, 120), cv2.FONT_HERSHEY_DUPLEX, .6, (0, 255, 0), 1)
               
            
                
            return tableCorners



        #————————————Start puck detection on s key—————————————————

        def puckDetection(key):


            while True:
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
                roi = flatFrameHSV[1300: 4600,100: 700]
            

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
            
                        centresRed.append((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00'])))
                
                print("red puck centres = ", centresRed)
                


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
                        moments = cv2.moments(cnt)
                        centresBlue.append((int(moments['m10']/moments['m00']), int(moments['m01']/moments['m00'])))
                
                print("blue puck centres = ", centresBlue)
            
                        


                
                #show Frame
                cv2.imshow("flatframe", flatFrameClean)
                cv2.imshow("puckframe", flatFrame)
                cv2.imshow("redMask", maskRed)
                cv2.imshow("blueMask", maskBlue)
                    #break loop
                key = cv2.waitKey(30)
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
            key = cv2.waitKey(30)
            if key == 97: #key "a"
                tabCorners = findCornermarkers()
                print("a pressed")
                print(tabCorners)


            if key == 115: #key "s"
                #start Looking for pucks
                print("Puck detection Initiallized")
                puckDetection(key) 

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





