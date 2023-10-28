import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import LandingPage from './pages/landing-page'
import SignUp from './components/signup'
import Login from './components/login'
import RecoverPassword from './components/recoverPasswrod'
import Dashboard from './pages/dashboard'

const App = () => {
    
    return (
    <ChakraProvider>
        <BrowserRouter>
            <Routes>
                <Route path='/' Component={LandingPage } />
                <Route path='/signup' Component={SignUp } />
                <Route path='/login' Component={Login } />
                <Route path='/recoverpassword' Component={RecoverPassword } />
                <Route path='/dashboard' Component={Dashboard} />
            </Routes>
        </BrowserRouter>
    </ChakraProvider>
    )
}

export default App