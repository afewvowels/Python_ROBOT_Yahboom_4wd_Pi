import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import global from '../Themes/global';

const MainWrapper = styled.main`
    display: grid;
    grid-template:
        'heading heading heading' 3rem
        'video video messages' auto
        'video video messages' auto
        'buttons buttons buttons' auto
        / 33.3% 33.3% 33.3%;
    max-width: 100rem;
    justify-self: center;
`;

const Heading = styled.h2`
    grid-area: heading;
    display: flex;
    align-items: flex-start;
    justify-content: center;
`;

const VideoFeed = styled.img`
    grid-area: video;
    max-width: 100%;
    align-self: center;
    justify-self: center;
`;

const MessageFeed = styled.div`
    grid-area: messages;
    display: block;
    // flex-direction: column;
    // align-items: center;
    justify-content: flex-start;
`;

const FeedHeading = styled.h3`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2.5rem;
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

export default function Controls() {
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
        var speed = document.getElementById('go-fast').value;
        var duration = document.getElementById('duration').value;

        if (speed == 'go-fast') {
            speed = 0;
        } else {
            speed = 1;
        }

        var data = {
            'move': move,
            'duration': parseInt(duration),
            'fast': speed
        }

        fetch('/move', {
            method: 'POST',
            body: data
        });
    }

    const ledState = value => () => {
        var r, g, b, state
        r = document.getElementById('red').value
        r = r / 100.0

        g = document.getElementById('green').value
        g = g / 100.0

        b = document.getElementById('blue').value
        b = b / 100.0

        state = document.querySelector('input[name="led-state"]:checked').value

        var data = {
            'led_r': r,
            'led_g': g,
            'led_b': b,
            'led_state': state
        }

        fetch('/led_set', {
            method: 'POST',
            body: data
        })
    }

    return(
        <MainWrapper>
            <Heading>Controls</Heading>
            <VideoFeed src='http://192.168.86.48:5000/cam1' />
            <MessageFeed id='status-container'>
                <FeedHeading>Messages</FeedHeading>
                <FeedBody id='status-feed'></FeedBody>
            </MessageFeed>
            <Buttons>
                <div>
                    <h3>Functions</h3>
                    <button onClick={button('/test_button1')}>Test1</button>
                    <button onClick={button('/test_button2')}>Test2</button>
                </div>
                <div>
                    <h3>Movement</h3>
                    <button onClick={move('turn_left')}>T Left</button>
                    <button onClick={move('forward')}>Forward</button>
                    <button onClick={move('turn_right')}>T Right</button>
                    <button onClick={move('left')}>Left</button>
                    <button onClick={move('backward')}>Backward</button>
                    <button onClick={move('right')}>Right</button>
                    <label for='duration'>Duration of move (1 to 5):</label>
                    <input type='range' id='duration' name='duration' min='1' max='5' list='tickmarks-duration' />
                    <datalist id="tickmarks-duration">
                        <option value="1" label="1"></option>
                        <option value="2"></option>
                        <option value="3" label="3"></option>
                        <option value="4"></option>
                        <option value="5" label="5"></option>
                    </datalist>
                    <label for='go-fast'>Go Fast!:</label>
                    <input type='checkbox' id='go-fast' name='go-fast' value='go-fast' />
                </div>
                <div>
                    <h3>LED Controls</h3>
                    <span>
                        <p>LED State:</p>
                        <label for='on'>On:</label>
                        <input type='radio' id='on' name='led-state' value='on' checked />
                        <label for='off'>Off:</label>
                        <input type='radio' id='off' name='led-state' value='off' />
                        <label for='pulse'>Blink:</label>
                        <input type='radio' id='blink' name='led-state' value='blink' />
                    </span>
                    <span>
                        <p>Color Values:</p>
                        <label for='red'>Red:</label>
                        <input type='range' id='red' name='red' min='0' max='100' />
                        <label for='green'>Green:</label>
                        <input type='range' id='green' name='green' min='0' max='100' />
                        <label for='blue'>Blue:</label>
                        <input type='range' id='blue' name='blue' min='0' max='100' />
                    </span>
                    <button onClick={ledState()}>Submit</button>
                </div>
            </Buttons>
        </MainWrapper>
    );
}