import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import global from '../Themes/global';

const MainWrapper = styled.main`
    display: flex;
    align-items: flex-start;
    justify-content: center;
`;

export default function Controls() {
    const feed = document.getElementById('status-feed')

    const button = (props) => {
        var msgHTML = document.createElement('span');
        fetch(props)
            .then(res => res.json())
            .then(data => {
                msgHTML.innerHTML = data.msg
            });
        document.getElementById('status-feed').appendChild(msgHTML);
    }

    return(
        <MainWrapper>
            <p>Controls</p>
            <img src='http://192.168.86.48:5000/cam1' />
            <div id='status-feed'></div>
            <button onClick={button('/test_button1')}>Test1</button>
            <button onClick={button('/test_button2')}>Test2</button>
        </MainWrapper>
    );
}