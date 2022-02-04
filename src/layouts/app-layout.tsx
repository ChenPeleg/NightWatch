import React from 'react'

import {themeMain} from '../hoc/themes';
import {MainLayout} from './main-layout';
import {ThemeProvider} from '@mui/material';
import {AppNavBar} from '../components/NavBar/app-nav-bar';
import {Loading} from '../components/Loading/loading';


export const AppLayout = () => {
    // useLayoutEffect(() => {
    //     document.body.setAttribute('dir', 'ltr');
    // }, [])

    return (
        <ThemeProvider theme={themeMain}>
            <div className="app-background" dir={'ltr'}>
                <AppNavBar/>
                <Loading/>

                <MainLayout/>

            </div>
        </ThemeProvider>

    )

}
