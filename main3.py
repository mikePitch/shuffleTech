#import things
import cv2
import numpy as np
from tracker import *

#import matplotlib.pyplot as plt


#create tracker object
tracker = EuclideanDistTracker()

#set Variables
#dimensions of table in mm
tableWidth = 600
tableLength = 2500
puckRadius = 35
puckArea = puckRadius * puckRadius * 3.14

#number of mm outside table to show in frame
tablePadding = 100

#filter Image Parameters
saturation = 100


#get video feed | webcam is cap = cv2.VideoCapture(0)
#cap = cv2.VideoCapture("shuffle_video.mpeg")
cap = cv2.VideoCapture(1)

#run loop for every frame
while True:

    #read frame
    ret, frame = cap.read()

    #detect markers
    arucoDict = cv2.aruco.Dictionary_get(cv2.aruco.DICT_4X4_50)
    arucoParams = cv2.aruco.DetectorParameters_create()
    (corners, ids, rejected) = cv2.aruco.detectMarkers(frame, arucoDict,
	parameters=arucoParams)

    print(ids, corners)
    
    # if len(corners) > 0:
	# 	# flatten the ArUco IDs list
    #     ids = ids.flatten()
	# 	# loop over the detected ArUCo corners
    #     for (markerCorner, markerID) in zip(corners, ids):
	# 		# extract the marker corners (which are always returned
	# 		# in top-left, top-right, bottom-right, and bottom-left
	# 		# order)
    #         corners = markerCorner.reshape((4, 2))
    #         (topLeft, topRight, bottomRight, bottomLeft) = corners
    #         # convert each of the (x, y)-coordinate pairs to integers
    #         topRight = (int(topRight[0]), int(topRight[1]))
    #         bottomRight = (int(bottomRight[0]), int(bottomRight[1]))
    #         bottomLeft = (int(bottomLeft[0]), int(bottomLeft[1]))
    #         topLeft = (int(topLeft[0]), int(topLeft[1]))


    #find corners of table
    topLeft = [511,54]
    topRight = [737,51]
    bottomLeft = [426,711]
    bottomRight = [872,695]

    # print("top left =", topLeft)
    # print("top Right =", topRight)
    # print("bottom Left =", bottomLeft)
    # print("bottom Right =", bottomRight)

    #co-ordinates in frame of table corners
    pts1 = np.float32([topLeft,topRight,bottomLeft,bottomRight])
    #co-ordinates those points will be remapped to in flatFrame
    pts2 = np.float32([[tablePadding,tablePadding],[tablePadding + tableWidth,tablePadding],[tablePadding,tablePadding + tableLength],[tablePadding + tableWidth,tablePadding + tableLength]])


    #change perspective of frame
    M = cv2.getPerspectiveTransform(pts1,pts2)
    flatFrame = cv2.warpPerspective(frame,M,(tablePadding * 2 + tableWidth,tablePadding * 2 + tableLength))
    
 
    #———————————————temporary puck detection start————————————————————————

    # convert to hsv colorspace
    flatFrameHSV = cv2.cvtColor(flatFrame, cv2.COLOR_BGR2HSV)
    # find the colors within the boundaries
    roi = flatFrameHSV[1200: 2600,100: 700]
   

    #——————————————Red Mask————————————————
    #set the lower and upper bounds for the red hue (red hsv wraps)
    lower_red = np.array([0,50,50])
    upper_red = np.array([10,255,255])

    lower_red2 = np.array([175,50,50])
    upper_red2 = np.array([180,255,255])

    #create a mask for red colour using inRange function
    redMask2 = cv2.inRange(flatFrameHSV, lower_red2, upper_red2)
    redMask1 = cv2.inRange(flatFrameHSV, lower_red, upper_red)
    maskRed = redMask1 | redMask2

    #filling in holes in mask by finding the contours filling them and adding it to the mask

    contoursRed, _ = cv2.findContours(maskRed, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contoursRed:
        hull = cv2.convexHull(cnt)
        # Calculate area and remove small elements
        area = cv2.contourArea(hull)
        if area > 100:
            cv2.drawContours(maskRed, [hull], -1, (255,255, 255), -1)

            
    #red pucks white circles

    #findWhites
    lower_whites = np.array([0,0,230])
    upper_whites = np.array([180,255,255])

    #create a mask for white colour using inRange function
    maskWhite = cv2.inRange(flatFrameHSV, lower_whites, upper_whites)

    maskRedCenters = cv2.bitwise_and(maskWhite, maskRed)

    contoursRedCenters, _ = cv2.findContours(maskRedCenters, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    for cnt2 in contoursRedCenters:
        hull2 = cv2.convexHull(cnt2)
        # Calculate area and remove small elements
        area = cv2.contourArea(cnt2)
        if area > 80:
            cv2.drawContours(flatFrame, [hull2], -1, (0, 255, 0), 2)
            # ellipse = cv2.fitEllipse(hull)
            # cv2.ellipse(frame,ellipse,(0,255,0),2)
            x, y, w, h = cv2.boundingRect(hull2)
            detections.append([x, y, w, h])




    #——————————————Blue Mask————————————————     
    #set the lower and upper bounds for the blue hue (red hsv wraps)
    lower_blue = np.array([0,50,50])
    upper_blue = np.array([10,255,255])

    #create a mask for blue colour using inRange function
    maskBlue = cv2.inRange(flatFrameHSV, lower_blue, upper_blue)

     #———————————————temporary puck detection end————————————————————————



    #detect red pucks

    #detect blue pucks

    #count throws

    #track pucks

        # 2. Object Tracking
    boxes_ids = tracker.update(detections)
    for box_id in boxes_ids:
        x, y, w, h, id = box_id
        cv2.putText(flatFrame, str(id), (x, y - 15), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 2)
        #cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)


    #position and id of pucks
    

    #display everything
    cv2.imshow("VideoFeed", frame)
    # cv2.imshow("roi", roi)
    cv2.imshow("Flattened Frame", flatFrame)
    cv2.imshow("Mask", maskRed)
    cv2.imshow("MaskRedCnters", maskRedCenters)

    #break loop
    key = cv2.waitKey(30)
    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()
