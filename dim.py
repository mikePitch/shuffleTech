import depthai as dai

# Table dimensions
tableWidth = 600
tableLength = 3462
puckRadius = 35

# Number of mm outside table to show in frame
tablePadding = 0

# Filter Image Parameters
saturation = 100

# Default Corners of table
topLeft = [511,54]
topRight = [737,51]
bottomLeft = [426,711]
bottomRight = [872,695]


def cameraSettings(device):
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