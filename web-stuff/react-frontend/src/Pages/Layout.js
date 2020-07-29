import React from 'react';

import Header from '../Components/header';
import Footer from '../Components/footer';
import Controls from '../Components/controls';

import global from '../Themes/global';

import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    * {
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Roboto', sans-serif;
        color: ${global.color};
        background-color: ${global.background};
        height: 100vh;
        display: grid;
        grid-template:
            "header" 4rem
            "controls" auto
            "footer" 2.5rem
            / auto;
    }

    h1 {
        font-weight: ${global.heading};
    }

    h6, p {
        font-weight: ${global.body};
    }
`;

export default function Layout() {
    return(
        <>
            <Header />
            <Controls />
            <Footer />
            <GlobalStyle />
        </>
    )
}