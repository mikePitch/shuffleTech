import pyfirmata
import time

port = '/dev/cu.usbmodem14101'

board = pyfirmata.Arduino('/dev/cu.usbmodem14101')

it = pyfirmata.util.Iterator(board)
it.start()

switchPin = board.digital[2]

switchPin.mode = pyfirmata.INPUT
time.sleep(1)

print('ready')
while True:
    sw = switchPin.read()
    if sw is True:
        board.digital[13].write(1)
        print('button pressed')

        while True:
            sw = switchPin.read()
            if sw is False:
                break

    else:
        board.digital[13].write(0)
        



