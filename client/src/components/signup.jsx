import React, {useState, useEffect} from 'react'
import { Container, Box, VStack, HStack,Grid, GridItem, Heading, Spacer,ButtonGroup, Button, Flex, Text, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import {Link, Navigate, useNavigate} from 'react-router-dom'


const SignUp = () => {
    const navigate = useNavigate()
    const [newUser, setNewUser] = useState({firstName: '', lastName: '', email: '', password: ''})
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)


    const handleInput = (e)=>{
        const nam = e.target.name
        const value = e.target.value
        setNewUser({...newUser, [nam]: value})
    }

    const handleSubmit = ()=>{
        const {firstName, lastName, email, password} = newUser
        if (!firstName || !lastName || !email || !password) {
            console.log('field cannot be emplty')
        }
        setNewUser({firstName: '', lastName: '', email: '', password: ''})
    }
    return (
        <Grid templateColumns='repeat(13, 1fr)' h={'100vh'} w={'100vw'}>
            <GridItem colSpan={7} bg={'blue.200'}>

            </GridItem>
            <GridItem colSpan={6} bg={'white'} h={'100%'} margin={'auto'}>
                <Grid templateRows={'repeat(15, 1fr)'} h={'100%'}>
                    <GridItem rowSpan={3} h={'100%'}>
                        <VStack h={'100%'}  pt={'2.5rem'} alignItems={'center'}>
                            <Box fontWeight={'extrabold'}>DrivIt</Box>
                            <Heading size={'md'} fontWeight={'bold'} color={'blue.400'}>DIVAD TECHNOLOGIES</Heading>
                            <Text>Create an account</Text>
                        </VStack>
                    </GridItem>
                    <GridItem rowSpan={10}  w={'27rem'}  p={2} >
                        <Button size={'md'} colorScheme='linkedin' w={'100%'}>Sign up with google</Button>
                        <VStack w={'100%'} mt={'2rem'} >
                            <Box w={'100%'}>
                                <Text mb={'8px'}>First Name</Text>
                                <Input name='firstName' value={newUser.firstName} variant='outline' placeholder='First name' onChange={(e)=>handleInput(e)}  />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Last Name</Text>
                                <Input name='lastName'  value={newUser.lastName} variant='outline' placeholder='Last name' onChange={(e)=>handleInput(e)}  />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Email</Text>
                                <Input type='email' name='email' value={newUser.email} variant='outline' placeholder='Email'  onChange={(e)=>handleInput(e)} />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Password</Text>
                                <InputGroup size='md'>
                                    <Input pr='4.5rem' name='password' type={show ? 'text' : 'password'} placeholder='password' value={newUser.password} onChange={(e)=>handleInput(e)}/>
                                    <InputRightElement width='4.5rem'>
                                        {newUser.password && <Button h='1.75rem' size='sm' onClick={handleClick}>
                                            {show ? 'Hide' : 'Show'}
                                        </Button>}
                                    </InputRightElement>
                                </InputGroup>

                            </Box>
                        </VStack>
                        <Button size={'md'} mt={'2rem'}  colorScheme='blue'  bg={'blue.400'} w={'100%'} onClick={handleSubmit}>Sign up</Button>
                    </GridItem>
                    <GridItem rowSpan={2} w={'100%'} display={'flex'} justifyContent={'center'} alignItems={'flex-start'}> <Text>Already have an account</Text> 
                    <Link to={'/login'} >
                    <Text color={'orange.700'} pl={1}> login</Text></Link></GridItem>
                </Grid>
            </GridItem>
        </Grid>
    )
}

export default SignUp