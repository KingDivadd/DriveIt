import React,{useEffect, useState} from 'react'
import axios from 'axios'
import { Container, Grid, GridItem, Flex, Box, Spacer, HStack, Text, VStack , Wrap, WrapItem, Avatar} from '@chakra-ui/react'
import {BiDotsVerticalRounded, BiSolidMessageSquareEdit} from 'react-icons/bi'
import {TiGroup} from 'react-icons/ti'
import { AiOutlineSearch } from 'react-icons/ai'
import { IoMdPersonAdd} from 'react-icons/io'
import ChatModel from '../component/chatModel'
import SearchModel from '../component/searchModel'
import { TypeModel } from '../component/searchModel'
import { ChatState } from '../contenxt/chatContext'
import MessageBlock from '../component/messageBlock'
import {SelfMessageBlock} from '../component/messageBlock'
import ScrollableChat from '../component/scrollableChat'

const Home = () => {
    const [showSearchModel, setShowSearchModel] = useState(false)
    const {chatInfo, selfMessageHolder,} = ChatState()

    function handleShowSearchModel() {
        if (showSearchModel) {
            setShowSearchModel(false)
        }
        if (!showSearchModel) {
            setShowSearchModel(true)
        }
    }
    return (
        <Container maxW={'container.2xl'} bg={'#3F4E4F'} h={'100vh'}>
            <Grid h='100%' templateRows='repeat(1, 1fr)' bg={'#27374D'} templateColumns='repeat(10, 1fr)' gap={1}>
                <GridItem rowSpan={1} colSpan={3} >
                    <Grid templateRows='repeat(11, 1fr)' height={'100%'}>
                        <GridItem rowSpan={1} borderRadius={'.3rem'} h={'100%'}  bg={'#27374D'} borderBottom={'1px solid #526D82'}>
                            <Flex h={'100%'}>
                                <Box p='4'>
                                    <Text className='app-name'>Anagram</Text>
                                </Box>
                                <Spacer />
                                <Box p='4' h={'100%'}>
                                    <HStack h={'100%'} gap={3} >
                                        <IoMdPersonAdd  size={'1.65rem'} cursor={'pointer'} color='white' width={'1.75rem'}/>
                                        <AiOutlineSearch size={'1.65rem'} cursor={'pointer'} color='white' width={'1.75rem'} onClick={handleShowSearchModel}/>
                                        <TiGroup size={'1.65rem'} cursor={'pointer'} color='white' width={'1.75rem'}/>
                                        <BiSolidMessageSquareEdit size={'1.65rem'} cursor={'pointer'} color='white' width={'1.75rem'}/>
                                        <BiDotsVerticalRounded size={'1.65rem'} cursor={'pointer'} color='white' width={'1.75rem'} />
                                    </HStack>
                                </Box>
                            </Flex>
                        </GridItem>
                        <GridItem maxHeight={'calc(90vh)'} rowSpan={10} bg={'#526D82'} overflowY={'auto'}>
                            {showSearchModel && <SearchModel />}
                            <ChatModel />
                        </GridItem>
                    </Grid>
                </GridItem>
                <GridItem rowSpan={1} colSpan={7} border={'1px solid #27374D'}>
                    <Grid templateRows='repeat(11, 1fr)' height={'100%'}>
                        <GridItem rowSpan={1} bg={'#27374D'} borderRadius={'.3rem'} h={'100%'}>
                            <Flex h={'100%'} gap={5}>
                                <Box h={'100%'}  pl={4}>
                                    <Wrap h={'100%'} display={'grid'} placeItems={'center'}>
                                        <WrapItem>
                                        <Avatar name='Dan Abrahmov' src='https://bit.ly/dan-abramov' />
                                        </WrapItem>
                                    </Wrap>
                                </Box>
                                <Box pt={1}>
                                    <h3 className="chat-name">{chatInfo.chatName}</h3>
                                    <HStack>
                                        {chatInfo.users.map((data, ind)=>{
                                            return(
                                                    <p key={ind} className="chat-info">{data.name}</p>
                                            )
                                        })}
                                    </HStack>
                                </Box>
                                <Spacer />
                                <Box h={'100%'} pr={4}>
                                    <HStack h={'100%'} gap={3} >
                                        <BiDotsVerticalRounded size={'1.65rem'} cursor={'pointer'} color='white' width={'1.75rem'} />
                                    </HStack>
                                </Box>
                            </Flex>
                        </GridItem>
                        <GridItem rowSpan={9} bg={'#526D82'} overflowY={'auto'}  h={'80vh'} p={3.5}>
                            <ScrollableChat />
                        </GridItem>
                        <GridItem rowSpan={1} bg={'#27374D'} display={'flex'} alignItems={'center'} borderTopRightRadius={'.35rem'} borderTopLeftRadius={'.35rem'} pl={'.5rem'} pr={'.5rem'}>
                            <TypeModel />
                        </GridItem>
                    </Grid>
                </GridItem>
            </Grid>
        </Container>
        )
}

export default Home