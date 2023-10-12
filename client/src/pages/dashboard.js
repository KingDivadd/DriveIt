import React,{useEffect, useState} from 'react'
import axios from 'axios'
import { Container } from '@chakra-ui/react'
import { Avatar, Grid, Typography, Box } from '@mui/material'
import {BiDotsVerticalRounded, BiSolidMessageSquareEdit} from 'react-icons/bi'
import {TiGroup} from 'react-icons/ti'
import ChatModel from '../component/chatModel'
import SearchModel from '../component/searchModel'
import { AiOutlineSearch ,AiOutlinePlus} from 'react-icons/ai'
import HeaderMenu from '../component/headerMenu'
import {BiSolidSend} from 'react-icons/bi'
import MsgAreaMenu from '../component/msgareaMenu'
import { ChatState } from '../contenxt/chatContext';


const Dashboard = () => {
    const [users, setUsers] = useState([])
    const [drop, setDrop] = useState(false)
    const [messageArea, setMessageArea] = useState(false)
    const {chatInfo, setChatInfo} = ChatState()

    async function getUsers() {
        try {
            const {data} = await axios.get("http://localhost:5500/api/user")
            console.log(data)
        } catch (err) {
            
        }
    }
    useEffect(() => {
    // getUsers()
    }, [])

    const handleHeaderClick = ()=>{
        if (drop) {
            setDrop(false)
        }if (!drop) {
            setDrop(true)
        }
    }
    return (
            <Container maxW={'container.2xl'} bg='coral' h={'100vh'}>
                <Grid templateColumns = 'repeat(10, 1fr)'></Grid>
            </Container>
    )
}

export default Dashboard

