import time
from pyimagesearch.motion_detection.singlemotiondetector import SingleMotionDetector
from flask import Flask
from flask import Response
from flask import render_template
from imutils.video import VideoStream
import RPi.GPIO as GPIO
import threading
import argparse
import datetime
import imutils
import cv2
from PIL import Image

# initialize output frame & thread lock for
# multiple browser views
outputFrame = None
lock = threading.Lock()

# initialize flask app
app = Flask(__name__)

# intialize video stream
vs = VideoStream(0).start()
time.sleep(2.0)

@app.route('/')
def test_index():
    return render_template('index.html')

@app.route('/time')
def get_current_time():
    return {'time': time.time()}

@app.route('/clock')
def get_clock_time():
    return {'clock_time': time.clock()}

def detect_motion(frameCount):
    global vs, outputFrame, lock

    md = SingleMotionDetector(accumWeight=0.1)
    total = 0

    while True:
        frame = vs.read()
        frame = imutils.resize(frame, width=400)
        frame = frame[0:0, 1280:960]
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (7, 7), 0)

        timestamp = datetime.datetime.now()
        cv2.putText(frame, timestamp.strftime(
            '%A %d %B %Y %I:%M:%S%p'),
            (10, frame.shape[0] - 10),
            cv2.FONT_HERSHEY_SIMPLEX, 0.35, (0, 0, 255), 1)

        if total > frameCount:
            motion = md.detect(gray)

            if motion is not None:
                (thresh, (minX, minY, maxX, maxY)) = motion
                cv2.rectangle(frame, (minX, minY), (maxX, maxY), (0, 0, 255), 2)
            
        md.update(gray)
        total += 1

        with lock:
            outputFrame = frame.copy()

def generate():
    global outputFrame, lock

    while True:
        with lock:
            if outputFrame is None:
                continue

            (flag, encodedImage) = cv2.imencode('.jpg', outputFrame)

            if not flag:
                continue
            
        yield(b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + bytearray(encodedImage) + b'\r\n')
        
@app.route('/cam1')
def cam1():
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('-i', '--ip', type=str, required=True, help='ip address of the device')
    ap.add_argument('-o', '--port', type=int, default=5000, help='port number of the server (1024 to 65535)')
    ap.add_argument('-f', '--frame-count', type=int, default=32, help='# of frames to construct the background model')
    args = vars(ap.parse_args())

    t = threading.Thread(target=detect_motion, args=(args['frame_count'],))
    t.daemon = True
    t.start()

    app.run(host=args['ip'], port=args['port'], debug=True, threaded=True, use_reloader=False)

vs.stop()