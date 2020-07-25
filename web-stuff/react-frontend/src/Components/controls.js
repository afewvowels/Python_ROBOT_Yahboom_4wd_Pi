import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import global from '../Themes/global';

const MainWrapper = styled.main`
    display: flex;
    align-items: flex-start;
    justify-content: center;
`;

export default function Controls() {
    const [videoStream, setVideoStream] = useState(0);

    fetch('/cam1').then(image => {
        setVideoStream
    })

    return(
        <MainWrapper>
            <p>Controls</p>
        </MainWrapper>
    );
}