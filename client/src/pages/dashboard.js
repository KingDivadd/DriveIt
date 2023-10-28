import React, {useState, useEffect} from 'react'
import {Container, Box, VStack,Grid, GridItem, Heading, Button, Text, Input, InputGroup, InputRightElement, Flex } from '@chakra-ui/react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
    const navigate = useNavigate()
    return (
        <Grid templateColumns={'repeat(12, 1fr)'} w={'100vw'} h={'100vh'} bg={'coral'} m={0}>
            <GridItem colSpan={2} bg={'blue.200'}>
                <Flex h={'100%'} flexDir={'column'} bg={'blue.500'} pr={1}>
                    <Box  height={'3.5rem'} pl={3} display={'flex'} alignItems={'center'}>
                        <Heading fontSize={'1.7rem'} color={'white'}>DrivIt</Heading>
                    </Box>
                    <Box h={'calc(100% - 3.5rem)'} pl={1}>
                        <Flex  flexDir={'column'} justifyContent={'flex-start'}>
                            <Box h={'3rem'} bg={'white'} pl={2} borderRadius={'.2rem'} display={'flex'} alignItems={'center'}> <Text>Dashboard</Text> </Box>
                            <Box h={'3rem'} bg={'white'} pl={2} borderRadius={'.2rem'} display={'flex'} alignItems={'center'}> <Text>Dashboard</Text> </Box>
                            <Box h={'3rem'} bg={'white'} pl={2} borderRadius={'.2rem'} display={'flex'} alignItems={'center'}> <Text>Dashboard</Text> </Box>
                            <Box h={'3rem'} bg={'white'} pl={2} borderRadius={'.2rem'} display={'flex'} alignItems={'center'}> <Text>Dashboard</Text> </Box>
                            

                        </Flex>
                    </Box>
                </Flex>
            </GridItem>
            <GridItem colSpan={10} bg={'green'}>
                <Flex h={'100%'} flexDir={'column'} >
                    <Box bg={'orange'} height={'3.5rem'}>left top</Box>
                    <Box bg={'cyan'} h={'calc(100% - 3.5rem)'}>left top</Box>
                </Flex>
            </GridItem>
        </Grid>
    )
}

export default Dashboard