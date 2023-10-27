import React from 'react'
import { Container, Box, VStack, HStack,Grid, GridItem, Heading, Spacer,ButtonGroup, Button, Flex, Text } from '@chakra-ui/react'
import {Navigate, useNavigate} from 'react-router-dom'
const LandingPage = () => {
    const navigate = useNavigate()
    return (
        <VStack gap={0}>
            <Container maxW='100vw' minH={'100vh'} bg='blue.600' color='white' p={0}>
                <Grid templateRows='repeat(14, 1fr)' height={'100vh'} gap={0}>
                
                    <GridItem rowSpan={1} bg={'white'}>
                        <Flex minWidth='max-content' h={'100%'} p={'0 4rem'} alignItems='center' gap='2'>
                            <Heading size='md' color={'teal'}>DrIvIt</Heading>
                            <HStack p='2' ml={'3rem'} gap={5}>
                                <Button variant={'link'} color={'teal'}>About</Button>
                                <Button variant={'link'} color={'teal'}>Home</Button>
                                <Button variant={'link'} color={'teal'}>Blog</Button>
                                <Button variant={'link'} color={'teal'}>Contact Us</Button>
                            </HStack>
                            <Spacer />
                            <ButtonGroup gap='1' >
                                <Button size={'sm'} variant={'ghost'} colorScheme='teal' color={'teal'} onClick={()=>navigate('/login')}>Login</Button>
                                <Button size={'sm'} colorScheme='teal' onClick={()=>navigate('/signup')}>SignUp</Button>
                            </ButtonGroup>
                        </Flex>
                    </GridItem>
                    <GridItem rowSpan={13}  bg={'gold'}>
                        <Grid templateColumns='repeat(14, 1fr)' height={'100%'}>
                            <GridItem colSpan={8} bg={'blue.300'}>left</GridItem>
                            <GridItem colSpan={6} bg={'blue.600'}>right</GridItem>
                        </Grid>
                    </GridItem>
                </Grid>
            </Container>
            <Container maxW='100vw' minH={'100vh'} bg='purple.600' color='white'>
                "550px" Container
            </Container>
            <Container maxW='100vw' minH={'100vh'} bg='green.400' color='#262626'>
                "container.sm" Container
            </Container>
        </VStack>
    )
}

export default LandingPage