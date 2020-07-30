import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import global from '../Themes/global';

const MainWrapper = styled.main`
    display: grid;
    grid-template:
        'heading heading heading' 3rem
        'video video video' auto
        'video video video' auto
        'buttons buttons messages' auto
        / 33.3% 33.3% 33.3%;
    width: auto;
    max-width: 50rem;
    justify-self: center;

    img {
        grid-area: video;
        max-width: 100%;
        align-self: center;
        justify-self: center;
    }

    button {
        background-color: #fafafa;
        border: 1px solid #2a2a2a;
        border-radius: .1rem;
        min-width: 4rem;
        min-height: 1.5rem;
    }

    label {
        font-weight: 300;
    }
`;

const Heading = styled.h2`
    grid-area: heading;
    display: flex;
    align-items: flex-start;
    justify-content: center;
`;

const MessageFeed = styled.div`
    grid-area: messages;
    display: block;
    // flex-direction: column;
    // align-items: center;
    justify-content: flex-start;
`;

const ControlHeading = styled.h3`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.5rem;
    font-weight: 300;
`;

const FeedBody = styled.div`
    width: 100%;
    overflow: scroll;
    height: 25rem;
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
`;

const Buttons = styled.section`
    grid-area: buttons;
`;

const MovementWrapper = styled.div`
    > * + * {
        margin-top: 0.5rem;
    }
`;

const MoveControlsWrapper = styled.div`
    display: grid;
    grid-template:
        'rLeft forward rRight' 2rem
        'left backward right' 2rem
        / 33.3% 33.4% 33.3%;
    gap: 2px 2px;
`;

const MoveModifyWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
`;

const LEDWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;

    > h3 {
        align-self: center;
    }

    > span {
        width: 100%;
        display: flex;
        justify-content: space-between;
    }

    > * + * {
        margin-top: 0.5rem;
    }
`;

const ServoWrapper = styled.div`
    display: grid;
    grid-template:
        'heading heading' auto
        'camera us' auto
        / 50% 50%;
    gap: 5px 5px;

    > h3 {
        grid-area: heading;
    }

    > span {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;

        * + * {
            margin-top: 0.5rem;
        }
    }
`;

export default function Controls() {
    useEffect(() => {
        const interval = setInterval(() => {
            var videoFeed = document.getElementById('rbt-feed');
            var cpuText = document.getElementById('cpu-use');
            var memText = document.getElementById('mem-use');
            var netText = document.getElementById('net-use');
            
            // if (videoFeed.length > 0) {
            //     videoFeed[0].remove();
            // }
            
            // videoFeed = document.createElement('img');
            videoFeed.src = 'http://localhost:8080/stream?topic=/sxs_stereo/left/image_rect_color';
            // document.getElementById('main-wrapper').appendChild(videoFeed);

            fetch('/cpu_use')
                .then(res => res.json())
                .then(data => {
                    cpuText.innerHTML = data.msg;
                });
            fetch('/mem_use')
                .then(res => res.json())
                .then(data => {
                    memText.innerHTML = data.msg;
                });
            fetch('/net_use')
                .then(res => res.json())
                .then(data => {
                    netText.innerHTML = data.msg;
                });
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const button = value => () => {
        var msg, good
        var feed = document.getElementById('status-feed');
        fetch(value)
            .then(res => res.json())
            .then(data => {
                var msgHTML = document.createElement("div");
                msgHTML.innerHTML = data.msg;
                if (data.good) {
                    msgHTML.style.color = 'black';
                } else {
                    msgHTML.style.color = 'red';
                }
                feed.appendChild(msgHTML);
            });

        var height = document.getElementById('status-container').clientHeight - 32;
        feed.style.height = height;
        feed.style.maxHeight = height;
    }

    const move = value => () => {
        var move = value;
        var speed = document.getElementById('speed').value;
        var duration = document.getElementById('duration').value;

        // if (speed.checked) {
        //     speed = 0;
        // } else {
        //     speed = 1;
        // }

        console.log('move: ' + move);
        console.log('duration: ' + duration);
        console.log('speed: ' + speed);

        var toSend = new URLSearchParams();
        
        toSend.append('move', move);
        toSend.append('duration', duration);
        toSend.append('speed', speed);

        console.log('/move?' + toSend.toString());

        fetch('/move?' + toSend.toString(), {
            method: 'POST'
        }).then(response => response.text());
    }

    const ledState = value => () => {
        var r, g, b;

        if (document.getElementById('red').checked) {
            r = 0;
        } else {
            r = 1;
        }

        if (document.getElementById('green').checked) {
            g = 0;
        } else {
            g = 1;
        }

        if (document.getElementById('blue').checked) {
            b = 0;
        } else {
            b = 1;
        }

        var data = new URLSearchParams();

        data.append('led_r', r);
        data.append('led_g', g);
        data.append('led_b', b);

        fetch('/led_set?' + data.toString(), {
            method: 'POST'
        }).then(response => response.text());
    }

    const setServo = value => () => {
        var angle = 0;
        var data = new URLSearchParams();

        if (value == 'camera') {
            angle = document.getElementById('camera').value;
        } else {
            angle = document.getElementById('us').value;
        }
        data.append('angle', angle);

        if (value == 'camera'){
            fetch('/rotate_c?' + data.toString(), {
                method: 'POST'
            }).then(response => response.text());
        } else {
            fetch('/rotate_us?' + data.toString(), {
                method: 'POST'
            }).then(response => response.text());
        }
    }

    const saveImage = value => () => {
        fetch('/save', {
            method: 'GET'
        }).then(response => response.text());
    }

    return(
        <MainWrapper id='main-wrapper'>
            <Heading>Controls</Heading>
            {/* <img src="http://localhost:8080/stream?topic=/sxs_stereo/left/image_rect_color" /> */}
            <img src='' id='rbt-feed' />
            <MessageFeed id='status-container'>
                <ControlHeading>Messages</ControlHeading>
                <FeedBody id='status-feed'></FeedBody>
                <div>
                    <div>
                        <h4>CPU:</h4>
                        <p id='cpu-use'></p>
                    </div>
                    <div>
                        <h4>Memory:</h4>
                        <p id='mem-use'></p>
                    </div>
                    <div>
                        <h4>Network:</h4>
                        <p id='net-use'></p>
                    </div>
                </div>
            </MessageFeed>
            <Buttons>
                <MovementWrapper>
                    <ControlHeading>Movement</ControlHeading>
                    <MoveControlsWrapper>
                        <button onClick={move('turn_left')}>T Left</button>
                        <button onClick={move('forward')}>Forward</button>
                        <button onClick={move('turn_right')}>T Right</button>
                        <button onClick={move('left')}>Left</button>
                        <button onClick={move('backward')}>Backward</button>
                        <button onClick={move('right')}>Right</button>
                    </MoveControlsWrapper>
                    <MoveModifyWrapper>
                        <label for='duration'>Duration of move (1 to 5):</label>
                        <input type='range' id='duration' name='duration' min='1' max='5' list='tickmarks-duration' />
                        <datalist id="tickmarks-duration">
                            <option value="1" label="1">1</option>
                            <option value="2">2</option>
                            <option value="3" label="3">3</option>
                            <option value="4">4</option>
                            <option value="5" label="5">5</option>
                        </datalist>
                        <label for='speed'>Speed:</label>
                        <input type='number' id='speed' name='speed' min='20' max='50' />
                        {/* <label for='speed'>Go Fast!:</label>
                        <datalist id="tickmarks-speed">
                            <option value="0">0</option>
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="40">40</option>
                            <option value="50">50</option>
                        </datalist>
                        <input type='range' id='speed' name='speed' min='0' max='50' increment='5' list='tickmarks-speed' /> */}
                    </MoveModifyWrapper>
                </MovementWrapper>
                <LEDWrapper>
                    <ControlHeading>LED Controls</ControlHeading>
                    <p>Color Values:</p>
                    <span>
                        <label for='red'>Red:</label>
                        <input type='checkbox' id='red' name='red' />
                        <label for='green'>Green:</label>
                        <input type='checkbox' id='green' name='green' />
                        <label for='blue'>Blue:</label>
                        <input type='checkbox' id='blue' name='blue' />
                    </span>
                    <button onClick={ledState()}>Submit</button>
                </LEDWrapper>
                <ServoWrapper>
                    <ControlHeading>Servo Controls</ControlHeading>
                    <span>
                        <label for='camera'>Camera:</label>
                        <input type='range' id='camera' name='camera' min='0' max='180' step='1' />
                        <button onClick={setServo('camera')}>Send</button>
                    </span>
                    <span>
                        <label for='us'>Ultrasonic:</label>
                        <input type='range' id='us' name='us' min='0.0' max='180.0' step='1.0' />
                        <button onClick={setServo('us')}>Send</button>
                    </span>
                </ServoWrapper>
                <div>
                    <ControlHeading>Functions</ControlHeading>
                    <button onClick={saveImage('')}>Save</button>
                    <button onClick={button('/test_button1')}>Test1</button>
                    <button onClick={button('/test_button2')}>Test2</button>
                </div>
            </Buttons>
        </MainWrapper>
    );
}