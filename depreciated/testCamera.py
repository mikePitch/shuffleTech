#import things
from calendar import firstweekday
import cv2
from cv2 import imshow
import numpy as np

#Create an object to hold reference to camera video capturing
cap = cv2.VideoCapture(2)

#check if connection with camera is successfully
if cap.isOpened():
    ret, frame = cap.read()  #capture a frame from live video
    #check whether frame is successfully captured
    if ret:
        #print success if frame capturing was successful
        print("Success : Captured frame")

        while True:
            ret, frame = cap.read() 
            cv2.imshow("Frame", frame)

            key = cv2.waitKey(30)
            if key == 27:
                break
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




