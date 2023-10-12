import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import SignUp from './pages/signup'
import Login from './pages/Login'
import Home from './pages/home'
import ChatInfoProvider from './contenxt/chatContext'

const App = () => {
    
    return (
        <ChatInfoProvider>
            <ChakraProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/signup' Component={SignUp } />
                        <Route path='/' Component={Login } />
                        <Route path='/login' Component={Login } />
                        <Route path='/home' Component={Home} />
                    </Routes>
                </BrowserRouter>
            </ChakraProvider>
        </ChatInfoProvider>
    )
}

export default App