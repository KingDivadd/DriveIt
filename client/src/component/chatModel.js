import React,{useEffect, useState, useContext} from 'react'
import axios from 'axios'
import { Container, Grid, GridItem, Flex, Box, Spacer, HStack, Text, Wrap, WrapItem, Avatar } from '@chakra-ui/react'
import {FaCaretDown, FaCaretUp} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { ChatState } from '../contenxt/chatContext'
import io from 'socket.io-client'

const ENDPOINT = "http://localhost:5500";
var socket, selectedChatCompare;


const ChatModel = ()=>{ 
    const [chatSelected, setChatSelected] = useState(false)
    const [fetchChat, setFetchChat] = useState([])
    const [socketConnected, setSocketConnected] = useState(false)
    const navigate = useNavigate()
    const {setChatInfo, setSelfMessageHolder, user, setUser} = ChatState()


    const allChat = async()=>{
        const token = localStorage.getItem('token')
        if (token !== null) {
            try {
                const chat = await axios.get('http://localhost:5500/api/chat', {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                setFetchChat(chat.data.fetchChat)
            } catch (err) {
                console.log(err);
            }
        }else{
            navigate('/login')
        }
    }
    const connectToSocket = ()=>{
        if (localStorage.getItem('id') !== null) {
            setUser({...user, _id: localStorage.getItem('id')})
            console.log(user)
            socket = io(ENDPOINT)
            socket.emit = ("setup", user._id)
            socket.on("connection", ()=> setSocketConnected(true))  
        }
        else{
            navigate('/')
        }
    }
    useEffect(()=>{
        allChat()
    },[])
// -------FETCING MESSAGE-----
    const fetchMessage = async(id)=>{
        const token = localStorage.getItem('token')
        try {
            const message = await axios.get(`http://localhost:5500/api/message/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
            let data = message.data.allmessages
            let cage = []
            data.forEach(res => {
                let del = {content: res.content, id: res.sender._id};
                cage.push(del)
            });
            setSelfMessageHolder(cage)

        } catch (err) {
            console.log('error here : ',err);
        }
    }

    function handleSelectChat(data) {
        connectToSocket()
        setChatInfo(data)
        let id = data._id
        fetchMessage(id)
        if(chatSelected){
            setChatSelected(false)
        }if(!chatSelected){
            setChatSelected(true)
        }
    }
    return(
        <>
            {fetchChat.map((data,ind)=>{
                const {_id, chatName, isGroupChat, users, updatedAt} = data
                return(
                    <Flex key={ind} h={'4.5rem'} bg={'#27374D'} onClick={()=> handleSelectChat(data)} alignItems={'center'} borderBottom={'1px solid #526D82'} cursor={'pointer'}>
                        <Box p='4' h={'100%'} display={'flex'} alignItems={'center'}>
                            <Wrap>
                                <WrapItem>
                                <Avatar name='Dan Abrahmov' src='https://bit.ly/dan-abramov' />
                                </WrapItem>
                            </Wrap>
                        </Box>
                        <Grid templateRows='repeat(10, 1fr)' h={'100%'} pt={1}>
                            <GridItem rowSpan={'5'} className='chat-name' textOverflow={'ellipsis'}>{chatName} </GridItem>
                            <GridItem rowSpan={'4'} className='chat-info'>You: Already happened</GridItem>
                        </Grid>
                        <Spacer />
                        <Grid templateRows='repeat(10, 1fr)' h={'100%'} pr={4}>
                            <GridItem rowSpan={'5'} className='chat-info' pt={1}>10:15AM</GridItem>
                            <GridItem rowSpan={'4'} className='chat-info' pb={2} display={'flex'} justifyContent={'flex-end'} alignItems={'flex-end'}>{ chatSelected ? <FaCaretUp />: <FaCaretDown /> } </GridItem>
                        </Grid>
                        
                    </Flex>
                )
            })}
        </>
)
}

export default ChatModel