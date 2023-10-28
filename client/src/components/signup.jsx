import React, {useState, useEffect} from 'react'
import { Container, Box, VStack, HStack,Grid, GridItem, Heading, Spacer,ButtonGroup, Button, Flex, Text, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import {Link, Navigate, useNavigate} from 'react-router-dom'
import axios from 'axios'


const SignUp = () => {
    const navigate = useNavigate()
    const [newUser, setNewUser] = useState({firstName: '', lastName: '', email: '',phone: '', password: ''})
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)


    const handleInput = (e)=>{
        const nam = e.target.name
        const value = e.target.value
        setNewUser({...newUser, [nam]: value})
    }

    const handleSubmit = async()=>{
        const {firstName, lastName, email, password, phone} = newUser
        if (!firstName || !lastName || !email || !password) {
            console.log('field cannot be emplty')
        }else{
            let name = lastName + " " + firstName
            try {
                const newUser = await axios.post('http://localhost:5500/api/auth/signup', {name, email, password, phone}, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                // console.log(newUser.data.userInfo);
                setNewUser({firstName: '', lastName: '', email: '',phone: '', password: ''})
                
            } catch (err) {
                console.log(err.response.data.err);
                setNewUser({firstName: '', lastName: '', email: '',phone: '', password: ''})
            }
        }
    }
    return (
        <Grid templateColumns='repeat(13, 1fr)' h={'100vh'} w={'100vw'}>
            <GridItem colSpan={7} bg={'blue.200'}>

            </GridItem>
            <GridItem colSpan={6} bg={'white'} h={'100vh'} margin={'auto'}>
                <Grid templateRows={'repeat(15, 1fr)'} h={'100vh'} >
                    <GridItem rowSpan={2} h={'100%'}>
                        <VStack h={'100%'}  pt={'2.5rem'} alignItems={'center'}>
                            <Box fontWeight={'extrabold'}>DrivIt</Box>
                            <Heading size={'md'} fontWeight={'bold'} color={'blue.400'}>DIVAD TECHNOLOGIES</Heading>
                            <Text>Create an account</Text>
                        </VStack>
                    </GridItem>
                    <GridItem rowSpan={12}  w={'27rem'}  p={2}   >
                        {/* <Button size={'md'} colorScheme='linkedin' w={'100%'}>Sign up with google</Button> */}
                        <VStack w={'100%'} mt={'1rem'} gap={'1rem'}>
                            <Box w={'100%'}>
                                <Text mb={'8px'} fontWeight={'semibold'}>First Name</Text>
                                <Input size={'lg'}  name='firstName' value={newUser.firstName} variant='outline' placeholder='' onChange={(e)=>handleInput(e)}  />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'} fontWeight={'semibold'}>Last Name</Text>
                                <Input  size={'lg'} name='lastName'  value={newUser.lastName} variant='outline' placeholder='' onChange={(e)=>handleInput(e)}  />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'} fontWeight={'semibold'}>Email</Text>
                                <Input  size={'lg'} type='email' name='email' value={newUser.email} variant='outline' placeholder=''  onChange={(e)=>handleInput(e)} />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'} fontWeight={'semibold'}>Phone</Text>
                                <Input  size={'lg'} type='phone' name='phone' value={newUser.phone} variant='outline' placeholder=''  onChange={(e)=>handleInput(e)} />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'} fontWeight={'semibold'}>Password</Text>
                                <InputGroup size='md'>
                                    <Input  size={'lg'} pr='4.5rem' name='password' type={show ? 'text' : 'password'} placeholder='' value={newUser.password} onChange={(e)=>handleInput(e)}/>
                                    <InputRightElement width='4.5rem'>
                                        {newUser.password && <Button h='1.75rem' size='sm' onClick={handleClick}>
                                            {show ? 'Hide' : 'Show'}
                                        </Button>}
                                    </InputRightElement>
                                </InputGroup>

                            </Box>
                        </VStack>
                        <Button size={'lg'} mt={'2rem'}  colorScheme='blue'  bg={'blue.400'} w={'100%'} onClick={handleSubmit}>Sign up</Button>
                    </GridItem>
                    <GridItem rowSpan={1} w={'100%'} display={'flex'} justifyContent={'center'} alignItems={'flex-start'}> <Text>Already have an account</Text> 
                    <Link to={'/login'} >
                    <Text color={'orange.700'} pl={1}> login</Text></Link></GridItem>
                </Grid>
            </GridItem>
        </Grid>
    )
}

export default SignUp