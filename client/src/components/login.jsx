import React, {useState, useEffect} from 'react'
import {Box, VStack,Grid, GridItem, Heading, Button, Text, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'


const Login = () => {
    const navigate = useNavigate()
    const [newUser, setNewUser] = useState({ email: '', password: ''})
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)

    const handleInput = (e)=>{
        const nam = e.target.name
        const value = e.target.value
        setNewUser({...newUser, [nam]: value})
    }

    const handleLogin = async()=>{
        const {email, password} = newUser
        if (email || password) {
            try {
                const res = await axios.post('http://localhost:5500/api/auth/login', {email, password}, {
                headers: {
                    "Content-Type":"application/json"
                }})
                console.log("logged in successfully", res.data.userInfo)
                localStorage.setItem("token", res.data.token)
                setNewUser({email: '', password: ''})
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000);
            } catch (err) {
                console.log(err.response.data.msg);
            }
        }else{
            console.log('field cannot be empty')
        }
    }
    return (
        <Grid templateColumns='repeat(13, 1fr)' h={'100vh'} w={'100vw'}>
            <GridItem colSpan={7} bg={'blue.200'}>
                
            </GridItem>
            <GridItem colSpan={6} bg={'white'} h={'100%'} margin={'auto'}>
                <Grid templateRows={'repeat(15, 1fr)'} h={'100%'}>
                    <GridItem rowSpan={4} h={'100%'}>
                        <VStack h={'100%'}  pt={'2.5rem'} alignItems={'center'}>
                            <Box fontWeight={'extrabold'}>DrivIt</Box>
                            <Heading size={'md'} fontWeight={'bold'} color={'blue.400'}>DIVAD TECHNOLOGIES</Heading>
                            <Text>Login with credentials</Text>
                        </VStack>
                    </GridItem>
                    <GridItem rowSpan={9}  w={'27rem'}  p={2} >
                        {/* <Button size={'md'} colorScheme='linkedin' w={'100%'}>Login with google</Button> */}
                        <VStack w={'100%'} mt={'2rem'} >
                            
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Email</Text>
                                <Input size={'lg'} type='email' name='email' value={newUser.email} variant='outline'   onChange={(e)=>handleInput(e)} />
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Password</Text>
                                <InputGroup size='md'>
                                    <Input size={'lg'} pr='4.5rem' name='password' type={show ? 'text' : 'password'}  value={newUser.password} onChange={(e)=>handleInput(e)}/>
                                    <InputRightElement width='4.5rem'>
                                        {newUser.password && <Button h='1.75rem' size='sm' onClick={handleClick}>
                                            {show ? 'Hide' : 'Show'}
                                        </Button>}
                                    </InputRightElement>
                                </InputGroup>
                            </Box>
                        </VStack>
                        <Button size={'lg'} mt={'2rem'} colorScheme='blue'  bg={'blue.400'} w={'100%'} onClick={handleLogin}>Login</Button>
                        <Box w={'100%'} mt={'1rem'}display={'grid'} placeItems={'center'}>
                            <Link to={'/recoverpassword'}> <Text color={'blue.500'}>Forget password</Text> </Link>
                        </Box>
                    </GridItem>
                    <GridItem rowSpan={2} w={'100%'} display={'flex'} justifyContent={'center'} alignItems={'flex-start'}>Don't have an account?<Link to={'/signup'}>
                    <Text color={'orange.700'} ml={1}>Sign Up</Text> </Link></GridItem>
                </Grid>
            </GridItem>
        </Grid>
    )
}

export default Login