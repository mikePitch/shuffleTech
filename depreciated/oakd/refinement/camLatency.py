import cv2
import depthai as dai
from numpy import negative

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

device = dai.Device(pipeline)

controlQueue = device.getInputQueue('control')
ctrl = dai.CameraControl()
ctrl.setManualFocus(42)

controlQueue.send(ctrl)

ctrl = dai.CameraControl()
ctrl.setManualExposure(21500, 200)
controlQueue.send(ctrl)


effect_mode = dai.CameraControl.EffectMode.NEGATIVE
ctrl = dai.CameraControl()
ctrl.setEffectMode(effect_mode)
controlQueue.send(ctrl)
  
video = device.getOutputQueue(name="video", maxSize=1, blocking=False)

while True:
    frame = video.get().getCvFrame()
    cv2.imshow("Frame", frame)
    
    key = cv2.waitKey(1)    
    if key == 27: #key "esc"
        break

cv2.destroyAllWindows()