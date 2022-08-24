import cv2
import numpy as np
from tracker import *
import matplotlib.pyplot as plt

# Create tracker object
tracker = EuclideanDistTracker()

cap = cv2.VideoCapture("shuffle_video.mpeg")



# ret, calFrame = cap.read()
# rows,cols,ch = calFrame.shape
# pts1 = np.float32([[511,58],[737,51],[426,711],[872,695]])
# pts2 = np.float32([[0,0],[600,0],[0,2500],[600,2500]])
# M = cv2.getPerspectiveTransform(pts1,pts2)
# dst = cv2.warpPerspective(calFrame,M,(600,2500))
# plt.subplot(121),plt.imshow(calFrame),plt.title('Input')
# plt.subplot(122),plt.imshow(dst),plt.title('Output')
# plt.show()
# Object detection from Stable camera
# object_detector = cv2.createBackgroundSubtractorMOG2(history=100, varThreshold=40)


while True:
    #ret, frame = cap.read()
    

    ret, calFrame = cap.read()
    #rows,cols,ch = calFrame.shape
    topLeft = [511,58]
    pts1 = np.float32([topLeft,[737,100],[426,711],[872,695]])
    pts2 = np.float32([[60,60],[660,60],[60,2560],[660,2560]])
    M = cv2.getPerspectiveTransform(pts1,pts2)
    dst = cv2.warpPerspective(calFrame,M,(720,2620))

    #height, width, _ = dst.shape



    # convert to hsv colorspace
    hsv = cv2.cvtColor(dst, cv2.COLOR_BGR2HSV)
    # lower bound and upper bound for red color
    lower_bound = np.array([0, 0, 80])   
    upper_bound = np.array([150, 150, 255])
    # find the colors within the boundaries
    mask2 = cv2.inRange(dst, lower_bound, upper_bound)

    # Extract Region of interest
    roi = dst[340: 720,500: 800]

    # 1. Object Detection
    # mask = object_detector.apply(roi)
    # _, mask = cv2.threshold(mask, 254, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(mask2, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    detections = []
    for cnt in contours:
        hull = cv2.convexHull(cnt)
        # Calculate area and remove small elements
        area = cv2.contourArea(cnt)
        if area > 100:
            cv2.drawContours(dst, [hull], -1, (0, 255, 0), 2)
            # ellipse = cv2.fitEllipse(hull)
            # cv2.ellipse(frame,ellipse,(0,255,0),2)
            x, y, w, h = cv2.boundingRect(hull)
            detections.append([x, y, w, h])



            

    # 2. Object Tracking
    boxes_ids = tracker.update(detections)
    for box_id in boxes_ids:
        x, y, w, h, id = box_id
        cv2.putText(dst, str(id), (x, y - 15), cv2.FONT_HERSHEY_PLAIN, 2, (255, 0, 0), 2)
        #cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 3)

    cv2.imshow("roi", roi)
    cv2.imshow("Frame", dst)
    cv2.imshow("Mask", mask2)

    key = cv2.waitKey(30)
    if key == 27:
        break

cap.release()
cv2.destroyAllWindows()