import React from 'react'
import { SelfMessageBlock } from './messageBlock'
import { ChatState } from '../contenxt/chatContext'
import ScrollableFeed from 'react-scrollable-feed'

const ScrollableChat = () => {
    const {chatInfo, selfMessageHolder,} = ChatState()

    return (
        <ScrollableFeed>
            {selfMessageHolder.map((data,ind)=>{
                return(
                <SelfMessageBlock data={data} key={ind} />
                ) 
            })}
        </ScrollableFeed>
    )
}

export default ScrollableChat