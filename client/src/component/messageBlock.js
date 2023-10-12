import { Avatar, Box, Spacer, Flex, HStack } from '@chakra-ui/react'
import React, {useEffect, useState} from 'react'
import { ChatState } from '../contenxt/chatContext'
import { useNavigate } from 'react-router-dom'

export const SelfMessageBlock = ({data})=>{
    const {selfMessageHolder, loggedInUser} = ChatState()
    const [color, setColor] = useState(true)
    const [image, setImage] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        let myId = localStorage.getItem('id')
        if (myId === null) {
            navigate('/')
        }
        // console.log('checking 1 2', id);
        if (myId === data.id) {
            setColor(false)
            setImage(false)
        }else{
            setColor(true)
            setImage(true)
            let notMeIndex = selfMessageHolder.indexOf(data);
            if (notMeIndex > 0 && selfMessageHolder[notMeIndex].id === selfMessageHolder[notMeIndex - 1].id) {
                setImage(false)
            }
        }
    }, [data])
    return(
        <HStack className={color ? 'others-message-element':'message-element'} mb={'.25rem'} >
            {image && 
            <Box className='message-avatar'>
                <Avatar size={'sm'}  name='Dan Abrahmov' src='https://bit.ly/dan-abramov' />
            </Box>}
            <Box className='h4-holder'>
                <h4 className={color ? 'others-chat-message': 'chat-message'}  >{data.content}</h4>
            </Box>
        </HStack>
    )
}
