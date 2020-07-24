import React from 'react';
import styled from 'styled-components';
import global from '../Themes/global';
import icon from '../Themes/robot_icon.png';

const StyledHeader = styled.header`
    grid-area: 'header';
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Logo = styled.img`
    height: 100%;
`;

export default function Header() {
    return(
        <StyledHeader>
            <Logo src={icon} alt='Robot icon' />
            <h1>Robot Control App</h1>
        </StyledHeader>
    );
}