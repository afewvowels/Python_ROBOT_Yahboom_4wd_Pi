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
        var speed = document.getElementById('go-fast');
        var duration = document.getElementById('duration').value;

        if (speed.checked) {
            speed = 0;
        } else {
            speed = 1;
        }

        console.log('move: ' + move);
        console.log('duration: ' + duration);
        console.log('speed: ' + speed);

        var toSend = new URLSearchParams();
        
        toSend.append('move', move);
        toSend.append('duration', duration);
        toSend.append('fast', speed);

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
                        <p>Color Values:</p>
                        <label for='red'>Red:</label>
                        <input type='checkbox' id='red' name='red' />
                        <label for='green'>Green:</label>
                        <input type='checkbox' id='green' name='green' />
                        <label for='blue'>Blue:</label>
                        <input type='checkbox' id='blue' name='blue' />
                    </span>
                    <button onClick={ledState()}>Submit</button>
                </div>
            </Buttons>
        </MainWrapper>
    );
}