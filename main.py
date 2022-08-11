import cv2
from tracker import *

#create tracker object
tracker = EuclideanDistTracker()

cap = cv2.VideoCapture(2)

#create tracker object

#Object detection from stable camera
object_detector = cv2.createBackgroundSubtractorMOG2(history=100, varThreshold=150)

while True:
    ret, frame = cap.read()
    height, width, _ = frame.shape
    print(height, width)
    #extract Region of interst
    roi = frame[160: 720,300: 1000]

    #object detection
    mask = object_detector.apply(roi)
    _, mask = cv2.threshold(mask, 254, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        #calculate area and remove elements
        area = cv2.contourArea(cnt)
        if area > 100:
           # cv2.drawContours(frame, [cnt], -1, (0, 255, 0), 2)
           x, y, w, h = cv2.boundingRect(cnt)
           cv2.rectangle(roi, (x, y), (x + w, y + h), (0, 255, 255), 2)
           print (x, y, w, h)

    cv2.imshow("Mask", mask)
    cv2.imshow("Frame", frame)
    cv2.imshow("Roi", roi)
    

    key = cv2.waitKey(30)
    if key == 27:
        break

cap. release()
cv2.destroyAllWindows()