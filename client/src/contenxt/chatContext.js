import React from "react";
import {useState, createContext, useContext, useEffect}  from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios"
const ChatInfoContext  = createContext()

export const ChatInfoProvider = ({children})=>{
    const [user, setUser] = useState({})
    const [chatInfo, setChatInfo] = useState({chatName: 'DEFAULT NAME', chatPicture: 'default pic', chatMessages: '', chatLastMessage: '', users: [], chatId: ''})

    const [selfMessageHolder, setSelfMessageHolder] = useState([])
    
    return 
    <ChatInfoContext.Provider value={{chatInfo,setUser, user ,setChatInfo, selfMessageHolder, setSelfMessageHolder,}}>{children} </ChatInfoContext.Provider>
}
export const ChatState = () => {
    return useContext(ChatInfoContext);
};



export default ChatInfoProvider