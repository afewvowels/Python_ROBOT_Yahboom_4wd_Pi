# Camera resolutions:
# 2560x960
# 2560x720
# 1280x480
# 640x240


import time
# from pyimagesearch.motion_detection.singlemotiondetector import SingleMotionDetector
from flask import Flask
from flask import Response
from flask import render_template
from flask import request
# from imutils.video import VideoStream
import numpy as np
import RPi.GPIO as GPIO
import threading
import argparse
import datetime
import json
import os
import random
# import imutils
# import cv2
# import gpiozero
# from gpiozero.pins.rpigpio import RPiGPIOFactory
import signal

# initialize output frame & thread lock for
# multiple browser views
outputFrame = None
saveFrame = None
lock = threading.Lock()

# initialize flask app
app = Flask(__name__)

# intialize video stream
# vs = VideoStream(src=0, usePiCam=False, resolution=(1280, 480)).start()
# vs = cv2.VideoCapture(0)
# vs.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
# vs.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
# time.sleep(2.0)

# initialize pin style for gpiozero
# gpiozero.Device.pin_factory = RPiGPIOFactory()

# initialize pin style for RPi.GPIO
GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

# initialize leds
# led = gpiozero.RGBLED(22, 27, 24, active_high=True, initial_value=(0.0, 1.0, 0.0), pwm=False, pin_factory=RPiGPIOFactory())
LED_R = 22
LED_G = 27
LED_B = 24

GPIO.setup(LED_R, GPIO.OUT)
GPIO.setup(LED_G, GPIO.OUT)
GPIO.setup(LED_B, GPIO.OUT)

def led_values(r, g, b):
    if r == 0:
        GPIO.output(LED_R, GPIO.HIGH)
    else:
        GPIO.output(LED_R, GPIO.LOW)

    if g == 0:
        GPIO.output(LED_G, GPIO.HIGH)
    else:
        GPIO.output(LED_G, GPIO.LOW)
    
    if b == 0:
        GPIO.output(LED_B, GPIO.HIGH)
    else:
        GPIO.output(LED_B, GPIO.LOW)

# initialize servos
SERVO_ULTRASONIC = 23
SERVO_CAMERA = 11

GPIO.setup(SERVO_ULTRASONIC, GPIO.OUT)
GPIO.setup(SERVO_CAMERA, GPIO.OUT)

sUltrasonic = GPIO.PWM(SERVO_ULTRASONIC, 50)
sCamera = GPIO.PWM(SERVO_CAMERA, 50)

def moveUSServo(angle):
    # freq = angle / 18 + 2
    # GPIO.output(SERVO_ULTRASONIC, True)
    # sUltrasonic.ChangeDutyCycle(freq)
    # sleep(1)
    # GPIO.output(SERVO_ULTRASONIC, False)
    # sUltrasonic.ChangeDutyCycle(0)
    pulsewidth = (angle * 11) + 500
    GPIO.output(SERVO_ULTRASONIC, GPIO.HIGH)
    time.sleep(pulsewidth/1000000.0)
    GPIO.output(SERVO_ULTRASONIC, GPIO.LOW)
    time.sleep(20.0/1000-pulsewidth/1000000.0)

def moveCServo(angle):
    # freq = angle / 18 + 2
    # GPIO.output(SERVO_CAMERA, True)
    # sCamera.ChangeDutyCycle(freq)
    # time.sleep(1)
    # GPIO.output(SERVO_CAMERA, False)
    # sCamera.ChangeDutyCycle(0)
    pulsewidth = (angle * 11) + 500
    GPIO.output(SERVO_CAMERA, GPIO.HIGH)
    time.sleep(pulsewidth/1000000.0)
    GPIO.output(SERVO_CAMERA, GPIO.LOW)
    time.sleep(20.0/1000-pulsewidth/1000000.0)

# initialize motors && motor functions
speed = 0.0

rForward = 20
rBackward = 21
rPWM = 16

lForward = 19
lBackward = 26
lPWM = 13

GPIO.setup(lPWM,GPIO.OUT,initial=GPIO.HIGH)
GPIO.setup(lForward,GPIO.OUT,initial=GPIO.LOW)
GPIO.setup(lBackward,GPIO.OUT,initial=GPIO.LOW)
GPIO.setup(rPWM,GPIO.OUT,initial=GPIO.HIGH)
GPIO.setup(rForward,GPIO.OUT,initial=GPIO.LOW)
GPIO.setup(rBackward,GPIO.OUT,initial=GPIO.LOW)

# Set the PWM pin and frequency is 2000hz
pwm_LEFT = GPIO.PWM(lPWM, 2000)
pwm_RIGHT = GPIO.PWM(rPWM, 2000)
pwm_LEFT.start(0)
pwm_RIGHT.start(0)

def setSpeed(fast):
    global speed
    if fast == True:
        speed = 50
    elif fast == False:
        speed = 25
    pwm_LEFT.ChangeDutyCycle(speed)
    pwm_RIGHT.ChangeDutyCycle(speed)

def stopMotors(duration=0.0):
    time.sleep(duration)
    GPIO.output(lForward, GPIO.LOW)
    GPIO.output(lBackward, GPIO.LOW)
    GPIO.output(rForward, GPIO.LOW)
    GPIO.output(rBackward, GPIO.LOW)

def moveForward(duration, fast):
    setSpeed(fast)
    GPIO.output(lForward, GPIO.HIGH)
    GPIO.output(lBackward, GPIO.LOW)
    GPIO.output(rForward, GPIO.HIGH)
    GPIO.output(rBackward, GPIO.LOW)
    stopMotors(duration)

def moveLeft(duration, fast):
    setSpeed(fast)
    GPIO.output(lForward, GPIO.HIGH)
    GPIO.output(lBackward, GPIO.LOW)
    GPIO.output(rForward, GPIO.LOW)
    GPIO.output(rBackward, GPIO.LOW)
    stopMotors(duration)

def moveRight(duration, fast):
    setSpeed(fast)
    GPIO.output(lForward, GPIO.LOW)
    GPIO.output(lBackward, GPIO.LOW)
    GPIO.output(rForward, GPIO.HIGH)
    GPIO.output(rBackward, GPIO.LOW)
    stopMotors(duration)

def turnLeft(duration, fast):
    setSpeed(fast)
    GPIO.output(lForward, GPIO.HIGH)
    GPIO.output(lBackward, GPIO.LOW)
    GPIO.output(rForward, GPIO.LOW)
    GPIO.output(rBackward, GPIO.HIGH)
    stopMotors(duration)

def turnRight(duration, fast):
    setSpeed(fast)
    GPIO.output(lForward, GPIO.LOW)
    GPIO.output(lBackward, GPIO.HIGH)
    GPIO.output(rForward, GPIO.HIGH)
    GPIO.output(rBackward, GPIO.LOW)
    stopMotors(duration)

def moveBackwards(duration, fast):
    setSpeed(fast)
    GPIO.output(lForward, GPIO.LOW)
    GPIO.output(lBackward, GPIO.HIGH)
    GPIO.output(rForward, GPIO.LOW)
    GPIO.output(rBackward, GPIO.HIGH)
    stopMotors(duration)


@app.route('/')
def test_index():
    return render_template('index.html')

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/clock')
def get_clock_time():
    return {'clock_time': time.clock()}

# def detect_motion(frameCount):
#     global vs, outputFrame, lock, saveFrame

#     md = SingleMotionDetector(accumWeight=0.1)
#     total = 0

#     while True:
#         ret, frame = vs.read()
#         saveFrame = frame.copy()
#         cropped = frame[0:480, 0:640]
#         gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
#         gray = cv2.GaussianBlur(gray, (7, 7), 0)

#         timestamp = datetime.datetime.now()
#         cv2.putText(frame, timestamp.strftime(
#             '%A %d %B %Y %I:%M:%S%p'),
#             (10, cropped.shape[0] - 10),
#             cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)

#         if total > frameCount:
#             motion = md.detect(gray)

#             if motion is not None:
#                 (thresh, (minX, minY, maxX, maxY)) = motion
#                 cv2.rectangle(frame, (minX, minY), (maxX, maxY), (0, 0, 255), 2)
            
#         md.update(gray)
#         total += 1

#         with lock:
#             outputFrame = cropped.copy()

# def generate():
#     global outputFrame, lock

#     while True:
#         with lock:
#             if outputFrame is None:
#                 continue

#             (flag, encodedImage) = cv2.imencode('.jpg', outputFrame)

#             if not flag:
#                 continue
            
#         yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')
        
@app.route('/cam1')
def cam1():
    # return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')
    return Response('not using this anymore')

def appendTime():
    timestamp = datetime.datetime.now()
    timestamp = timestamp.strftime('%I:%M:%S%p')
    timestamp += ' '
    return timestamp

def returnJSONFormat(inString, good=True):
    return {'msg' : appendTime() + inString, 'good': good}

@app.route('/test_button1')
def test_button1():
    return json.dumps(returnJSONFormat('button pressed!'))

@app.route('/test_button2')
def test_button2():
    return json.dumps(returnJSONFormat('bad button pressed!', False))

@app.route('/led_set', methods=['POST'])
def led_set():
    try:
        if request.method == 'POST':
            r = int(request.args['led_r'])
            g = int(request.args['led_g'])
            b = int(request.args['led_b'])
    except Exception as e:
        return Response('led set error occurred')

    led_values(r, g, b)

    return Response(str('led set successful, r: ' + str(r) + ' g: ' + str(g) + ' b: ' + str(b)))

@app.route('/move', methods=['POST'])
def move():
    try:
        if request.method == 'POST':
            move = request.args['move']
            print('move: ' + move)
            duration = request.args['duration']
            print('duration: ' + duration)
            duration = float(duration)
            fast = request.args['fast']
            if int(fast) == 0:
                fastBool = True
                print('fast: yes')
            elif int(fast) == 1:
                fastBool = False
                print('fast: no')
    except Exception as e:
        return Response('move error occurred')
    
    if move == 'forward':
        moveForward(duration, fastBool)
    elif move == 'left':
        moveLeft(duration, fastBool)
    elif move == 'right':
        moveRight(duration, fastBool)
    elif move == 'turn_left':
        turnLeft(duration, fastBool)
    elif move == 'turn_right':
        turnRight(duration, fastBool)
    elif move == 'backward':
        moveBackwards(duration, fastBool)
    else:
        print('back move term provided')

    return Response('move successful')

@app.route('/rotate_us', methods=['POST'])
def rotate_us():
    moveUSServo(float(request.args['angle']))
    return Response('moved ultrasonic')

@app.route('/rotate_c', methods=['POST'])
def rotate_c():
    moveCServo(float(request.args['angle']))
    return Response('moved camera')

@app.route('/save', methods=['GET'])
def save():
    # global saveFrame
    # name = '/home/pi/Pictures/Webcam/stereo' + str(random.randrange(0, 10000)) + '.jpg'
    # # (flag, jpg) = cv2.imencode('.jpg', saveFrame)
    # cv2.imwrite(name, saveFrame, [cv2.IMWRITE_JPEG_QUALITY, 95])
    # return Response(str('image saved as: ' + name))
    return Response('not using this anymore')

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('-i', '--ip', type=str, default='0.0.0.0', help='ip address of the device')
    ap.add_argument('-o', '--port', type=int, default=5000, help='port number of the server (1024 to 65535)')
    ap.add_argument('-f', '--frame-count', type=int, default=32, help='# of frames to construct the background model')
    args = vars(ap.parse_args())

    t = threading.Thread(target=detect_motion, args=(args['frame_count'],))
    t.daemon = True
    t.start()

    app.run(host=args['ip'], port=args['port'], debug=True, threaded=True, use_reloader=False)

# vs.stop()
# vs.release()
