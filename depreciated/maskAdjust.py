#import things
from calendar import firstweekday
import cv2
from cv2 import imshow
import numpy as np

def clamp(num, v0, v1):
    return max(v0, min(num, v1))

#Create an object to hold reference to camera video capturing
cap = cv2.VideoCapture(0)

#check if connection with camera is successfully
if cap.isOpened():
    ret, frame = cap.read()  #capture a frame from live video
    #check whether frame is successfully captured
    if ret:
        #print success if frame capturing was successful
        print("Success : Captured frame")

        def puckDetection():

            lrh = 15
            lrs = 1
            lrv = 1
            urh = 95
            urs = 255
            urv = 255


            while True:
                ret, frame = cap.read() 
                frameHSV = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

                lower_red = np.array([lrh,lrs,lrv])
                upper_red = np.array([urh,urs,urv])

                maskRed = cv2.inRange(frameHSV, lower_red, upper_red)


                cv2.imshow("Frame", frameHSV)
                cv2.imshow("Mask", maskRed)

                

                key = cv2.waitKey(10)
                if key == ord('q'):
                    break

                elif key in [ord('1'), ord('2'), ord('3')]:
                    if key == ord('1'): editMask = "H"
                    if key == ord('2'): editMask = "S"
                    if key == ord('3'): editMask = "V"
                    print("Editing", editMask, "press [ or ] ")

                

                elif key in [ord('['), ord(']'), ord('-'), ord('=')]:
                    editUpperRange = False
                    if key in [ord('='), ord(']')]: 
                        change = 1
                        if key == ord('='):
                            editUpperRange = True

                    if key in [ord('-'), ord('[')]: 
                        change = -1
                        if key == ord('-'):
                            editUpperRange = True
                    


                    if editMask == "H":
                        if editUpperRange == False:
                            lrh = clamp(lrh + change, 0, 180)
                            print("lrh:", lrh)
                        else:
                            urh = clamp(urh + change, 0, 180)
                            print("urh:", urh)
                    if editMask == "S":
                        lrs = clamp(lrs + change, 0, 255)
                        print("lrs:", lrs)
                    if editMask == "V":
                        lrv = clamp(lrv + change, 0, 255)
                        print("lrv:", lrv)

                # elif key == ord('a'):
                #     lrh = clamp(lrh +1, 0, 180)
                #     print("lrh:", lrh)

                # elif key == ord('z'):
                #     lrh = clamp(lrh -1, 0, 180)
                #     print("lrh:", lrh)

        puckDetection()



        #↓↓↓↓↓↓——————————Write Program In Below——————————↓↓↓↓↓↓

        # #set Variables
        # #dimensions of table in mm
        # tableWidth = 600
        # tableLength = 2500
        # puckRadius = 35
        # puckArea = puckRadius * puckRadius * 3.14

        # #number of mm outside table to show in frame
        # tablePadding = 100

        # #filter Image Parameters
        # saturation = 100

        # def findCornermarkers():
        #     ret, frame = cap.read()

        #     #detect markers
        #     arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
        #     arucoParams = cv2.aruco.DetectorParameters_create()
        #     (corners, ids, rejected) = cv2.aruco.detectMarkers(frame, arucoDict, parameters=arucoParams)

        #     print(type(corners))
        #     print(len(corners))
        #     print(type(corners[0]))

        #     if len(corners) == 4:
        #         print("All " + str(len(corners)) + " markers detected")

        #         firstCorner = corners[0]
        #         firstCC = firstCorner[0]
        #         firstCCC = firstCC[0]
        #         firstCCC = (int(firstCCC[0]), int(firstCCC[1]))
        #         print(firstCCC, ids[0])

        #         secondCorner = corners[1]
        #         secondCC = secondCorner[0]
        #         secondCCC = secondCC[0]
        #         secondCCC = (int(secondCCC[0]), int(secondCCC[1]))
        #         print(secondCCC, ids[1])

        #         thirdCorner = corners[2]
        #         thirdCC = thirdCorner[0]
        #         thirdCCC = thirdCC[0]
        #         thirdCCC = (int(thirdCCC[0]), int(thirdCCC[1]))
        #         print(thirdCCC, ids[2])

        #         fourthCorner = corners[3]
        #         fourthCC = fourthCorner[0]
        #         fourthCCC = fourthCC[0]
        #         fourthCCC = (int(fourthCCC[0]), int(fourthCCC[1]))
        #         print(fourthCCC, ids[3])

        #         fourthCCC = (int(fourthCCC[0]), int(fourthCCC[1]))




        #     else:
        #         print("Found " + str(len(corners)) + " markers")





        # findCornermarkers()

         



         #↑↑↑↑↑↑——————————Write Program Above——————————↑↑↑↑↑↑

    #print error if frame capturing was unsuccessful
    else:
        print("Error : Failed to capture frame")

# print error if the connection with camera is unsuccessful
else:
    print("Cannot open camera")



cap.release()
cv2.destroyAllWindows()




def findCornermarkers():
    ret, frame = cap.read()

    #detect markers
    arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
    arucoParams = cv2.aruco.DetectorParameters_create()
    (corners, ids, rejected) = cv2.aruco.detectMarkers(frame, arucoDict,
	parameters=arucoParams)

    print(ids, corners)




