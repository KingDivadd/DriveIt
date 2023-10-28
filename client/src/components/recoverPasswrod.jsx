import React, {useState, useEffect} from 'react'
import {Box, VStack, Grid, GridItem, Heading, ButtonGroup, Button, Flex, Text, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'


const RecoverPassword = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState({ email: '',code: '', password: '', confirmPassword: ''})
    const [next, setNext] = useState(true)
    const [proNext, setProNext] = useState(true)
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)

    const handleInput = (e)=>{
        const nam = e.target.name
        const value = e.target.value
        setUser({...user, [nam]: value})
    }

    const handleRecovery = async()=>{
        // const {email} = user
        if (user.email) {
            // first check if the
            let email = user.email
            try {
                // i want to send a recovery code first
                await axios.post('http://localhost:5500/api/auth/password-recovery-code', {email}, {headers: {
                    "Content-Type":"application/json"
                }})
                setNext(false)
            } catch (err) {
                console.log(err.response.data.msg)
            }
        }else{
            console.log('field cannot be emplty')
        }
    }
    const handlePrev = ()=>{
        setNext(true)
    }
    const handleCode = async()=>{
        const {code, email} = user
        if (code) {
            // check whether the code is correct
            try {
                await axios.post('http://localhost:5500/api/auth/recovery-code-verify', {email, code}, {headers: {
                    "Content-Type":"application/json"
                }})
                console.log('code entered');
                setProNext(false)
            } catch (err) {
                console.log(err.response.data.err);
            }
        }else{
            console.log('Please enter the code');
        }
    }
    const handleGenCode = async()=>{
        try {
                // i want to send a recovery code first
                const email = user.email
                await axios.post('http://localhost:5500/api/auth/password-recovery-code', {email}, {headers: {
                    "Content-Type":"application/json"
                }})
                console.log('Check your email');
                setNext(false)
                setUser({...user,code: ''})
            } catch (err) {
                console.log(err.response.data.msg)
            }
    }
    const handleNewPass = async()=>{
        const {password, email} = user
        if (user.password || user.confirmPassword) {
            // check whether they are similar
            if (user.password === user.confirmPassword) {
                try {
                    await axios.post('http://localhost:5500/api/auth/recover-password', {email, password}, {
                    headers: {
                        "Content-Type":"application/json" }})
                        console.log('Password changed successfully.');
                } catch (err) {
                    console.log(err.response.data.msg);
                }
                navigate('/login')
            }else{ console.log('Passwords not similar');}
        }else{
            console.log("Fill all fields")
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
                            <Text>Password recovery</Text>
                        </VStack>
                    </GridItem>
                    { proNext ? <>
                    {next ? <GridItem rowSpan={9}  w={'27rem'}  p={2} >
                        <VStack w={'100%'} mt={'2rem'} >
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Email</Text>
                                <Input size={'lg'} type='email' name='email' value={user.email} variant='outline' placeholder='Email'  onChange={(e)=>handleInput(e)} />
                            </Box>
                        </VStack>
                        <Button size={'lg'} mt={'2rem'} colorScheme='blue'  bg={'blue.400'} w={'100%'} onClick={handleRecovery}>Get code</Button>
                        <Box w={'100%'} mt={'1rem'}display={'grid'} placeItems={'center'}>
                            <Link to={'/login'}> <Text color={'blue.500'}>login</Text> </Link>
                        </Box>
                    </GridItem> :
                    
                    <GridItem rowSpan={9} w={'27rem'} p={2}>
                        <VStack w={'100%'} mt={'2rem'}>
                            <Box bg={'green.100'} display={'flex'} w={'100%'} justifyContent={'center'} p={1} borderRadius={'.2rem'}>
                                <Text  >A recovery code has already been sent to {user.email}</Text>
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Enter code</Text>
                                <Input size={'lg'} type='text' name='code' value={user.code} variant='outline' placeholder='XXXXXX'  onChange={(e)=>handleInput(e)} />
                            </Box>
                            <Flex w={'100%'} gap={'2rem'} flexDir={'column'} >
                                <ButtonGroup  w={'100%'} gap={'4rem'}>
                                    <Button mt={'2rem'} variant={'link'} colorScheme='orange'  color={'orange.400'} w={'100%'} onClick={handlePrev}>Change email</Button>
                                    
                                    <Button mt={'2rem'} size={'lg'} colorScheme='blue'  bg={'blue.400'} w={'100%'} onClick={handleCode}>submit</Button>
                                </ButtonGroup>
                                <Button w={'100%'} variant={'link'} color={'blue.500'} onClick={handleGenCode}>Didn't receive any code, click here</Button>
                            </Flex>
                        </VStack>
                    </GridItem>
                    } </>:  
                    <GridItem rowSpan={9} w={'27rem'} p={2}>
                        <VStack>
                            <Text>Create a new password</Text>
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Password</Text>
                                <InputGroup size='md'>
                                    <Input size={'lg'} pr='4.5rem' name='password' type={show ? 'text' : 'password'}  value={user.password} onChange={(e)=>handleInput(e)}/>
                                    <InputRightElement width='4.5rem'>
                                        {user.password && <Button h='1.75rem' size='sm' onClick={handleClick}>
                                            {show ? 'Hide' : 'Show'}
                                        </Button>}
                                    </InputRightElement>
                                </InputGroup>
                            </Box>
                            <Box w={'100%'}>
                                <Text mb={'8px'}>Confirm Password</Text>
                                <InputGroup size='md'>
                                    <Input size={'lg'} pr='4.5rem' name='confirmPassword' type={show ? 'text' : 'password'}  value={user.confirmPassword} onChange={(e)=>handleInput(e)}/>
                                    <InputRightElement width='4.5rem'>
                                        {user.confirmPassword && <Button h='1.75rem' size='sm' onClick={handleClick}>
                                            {show ? 'Hide' : 'Show'}
                                        </Button>}
                                    </InputRightElement>
                                </InputGroup>
                            </Box>
                            <Button size={'lg'} mt={'2rem'} colorScheme='blue'  bg={'blue.400'} w={'100%'} onClick={handleNewPass}>Change Password</Button>
                        </VStack>
                    </GridItem>
                    }
                    <GridItem rowSpan={2} w={'100%'} display={'flex'} justifyContent={'center'} alignItems={'flex-start'}>Don't have an account?<Link to={'/signup'}>
                    <Text color={'orange.700'} ml={1}>Sign Up</Text> </Link></GridItem>
                </Grid>
            </GridItem>
        </Grid>
    )
}

export default RecoverPassword