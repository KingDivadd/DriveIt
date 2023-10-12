import React,{useEffect, useState} from 'react'
import axios from 'axios'
import { InputGroup, InputLeftElement, InputRightElement, Input } from '@chakra-ui/react'
import {FaCaretDown, FaCaretUp} from 'react-icons/fa'
import {MdClose} from 'react-icons/md'
import {FiSearch} from 'react-icons/fi'
import { AiOutlinePlus } from 'react-icons/ai'
import { ChatState } from '../contenxt/chatContext'
import { useNavigate } from 'react-router-dom'

const SearchModel = ({setDrop}) => {
    const [search, setSearch] = useState('')
    return (
        <InputGroup h={'3.25rem'} pt={'.5rem'} pb={'.5rem'} alignItems={'center'} >
            <InputLeftElement pointerEvents='none' mt={'.35rem'} cursor={'pointer'}>
                <FiSearch color='whitesmoke'/>
            </InputLeftElement>
            <Input type='tel' placeholder='Search chat or user' color={'whitesmoke'} focusBorderColor='white'  value={search} onChange={(e)=>setSearch(e.target.value)}/>
            <InputRightElement mt={'.35rem'}>
                <MdClose onClick={()=>setSearch('')} cursor={'pointer'} color='whitesmoke'/>
            </InputRightElement>
        </InputGroup>

        )
}

export const TypeModel = ()=>{
    const [type, setType] = useState('')
    const {selfMessageHolder, setSelfMessageHolder, loggedInUser, chatInfo} = ChatState()
    const navigate = useNavigate()

    async function handleSendMessage(event) {
        if (event.key === 'Enter' && type) {
            setType('')
            let myId = localStorage.getItem('id')
            if (myId === null) {
                navigate('/')
            }
            setSelfMessageHolder([...selfMessageHolder,{ content: type, id: myId}])
            // --------logiing to console--------------
            let token = localStorage.getItem('token')
            if (token !== null) {   
                try {
                    const message = await axios.post(`http://localhost:5500/api/message`, {content: type, chatId: chatInfo._id } ,{
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                } catch (err) {
                    console.log(err);
                }
            }else{
                navigate('/')
            }
        }
    }
    return(
        <InputGroup>
            <InputLeftElement pointerEvents='none' cursor={'pointer'}>
                <AiOutlinePlus color='whitesmoke'/>
            </InputLeftElement>
            <Input type='tel' placeholder='Type message here' value={type} focusBorderColor='white' onChange={(e)=>setType(e.target.value)} color={'white'} onKeyDown={handleSendMessage} />
            <InputRightElement>
                <MdClose onClick={()=>setType('')}  cursor={'pointer'} color='whitesmoke'/>
            </InputRightElement>
        </InputGroup>
    )
}

export default SearchModel