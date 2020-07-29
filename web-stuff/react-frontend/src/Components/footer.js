import React from 'react';
import styled from 'styled-components';
import global from '../Themes/global';

const StyledFooter = styled.footer`
    grid-area: 'footer';
    display: flex;
    align-items: center;
    justify-content: center;

    h6 {
        font-size: 1rem;
    }
`;

export default function Footer() {
    return(
        <StyledFooter>
            <h6>&copy;2020 Keith B. Smith</h6>
        </StyledFooter>
    );
}