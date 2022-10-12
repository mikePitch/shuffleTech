#import things
import cv2
import numpy as np
import depthai as dai


def clamp(num, v0, v1):
    return max(v0, min(num, v1))

#oakd Set up
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
# camRgb.setManualFocus(camRgb, 130)
# HERE 
cameraFound = False
while not cameraFound:
    try:
        device = dai.Device(pipeline)
        cameraFound = True
    except Exception as e:
        print("Camera Device error: " + str(e))
            

controlQueue = device.getInputQueue('control')
ctrl = dai.CameraControl()
ctrl.setManualFocus(30)

controlQueue.send(ctrl)

ctrl = dai.CameraControl()
ctrl.setManualExposure(13000, 400)
controlQueue.send(ctrl)


effect_mode = dai.CameraControl.EffectMode.NEGATIVE
ctrl = dai.CameraControl()
ctrl.setEffectMode(effect_mode)
controlQueue.send(ctrl)

ctrl = dai.CameraControl()
ctrl.setLumaDenoise(4)
controlQueue.send(ctrl)

ctrl = dai.CameraControl()
ctrl.setChromaDenoise(0)
controlQueue.send(ctrl)

ctrl = dai.CameraControl()
ctrl.setSaturation(4)
controlQueue.send(ctrl)

ctrl = dai.CameraControl()
ctrl.setManualWhiteBalance(4600)
controlQueue.send(ctrl)
  
video = device.getOutputQueue(name="video", maxSize=1, blocking=False)

#end of oakd setup


def maskCal():
    #Set Mask Defaults

    lrh = 0
    lrs = 0
    lrv = 0
    urh = 180
    urs = 255
    urv = 255


    while True:
        ccFrame = video.get().getCvFrame() 
        ccvHSV = cv2.cvtColor(ccFrame, cv2.COLOR_BGR2HSV)


        lower_red = np.array([lrh,lrs,lrv])
        upper_red = np.array([urh,urs,urv])

        maskRed = cv2.inRange(ccvHSV, lower_red, upper_red)


        
        cv2.imshow("Mask", maskRed)
        cv2.imshow('Select_Puck_Colour', ccFrame)



        key = cv2.waitKey(0)


        if key in [ord('1'), ord('2'), ord('3')]:
            if key == ord('1'): editMask = "H"
            if key == ord('2'): editMask = "S"
            if key == ord('3'): editMask = "V"
            print("Editing", editMask, "press [ or ] ")

        

        if key in [ord('['), ord(']'), ord('-'), ord('=')]:
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
                if editUpperRange == False:
                    lrs = clamp(lrs + change, 0, 255)
                    print("lrs:", lrs)
                else:
                    urs = clamp(urs + change, 0, 255)
                    print("urs:", urs)
            if editMask == "V":
                if editUpperRange == False:
                    lrv = clamp(lrv + change, 0, 255)
                    print("lrv:", lrv)
                else:
                    urv = clamp(urv + change, 0, 255)
                    print("urv:", urv)

        if key == ord('q'):
            break
                
            
    # if esc is pressed, close all windows.
    cv2.destroyAllWindows()
    
                
maskCal()
