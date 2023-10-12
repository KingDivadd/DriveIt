import * as React from 'react';
import { useState,useEffect } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Alert } from '@mui/material';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { ChatState } from '../contenxt/chatContext';

const defaultTheme = createTheme();

export default function SignUp() {
    const [name, setName] = useState('')
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [alert, setAlert] = useState({boo: false, value: '', serverity: ''})
    const {user, setUser} = ChatState()

    const navigate = useNavigate()

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!name || !email || !password || !confirmPassword) {
            setTimeout(() => {
                setAlert(true)
            }, 2500);
            setAlert({boo: true, value: 'Please fill all fields!!!', serverity: 'error'})
        }
        if (password !== confirmPassword) {
            setTimeout(()=>{
                setAlert({boo: false})
            }, 2000)
            setAlert({boo: true, value: 'passwords do not match!', serverity: 'error'})
        }

        // now we have to make sure the email is not being used by another person
        try {
            const user = await  axios.get('http://localhost:5500/api/user')
            let fetchedUsers = user.data.users
            let filter = fetchedUsers.filter(fish=> fish.email === email)
            if (filter.length  < 1) {
                try {
                    const config = {
                        header: {
                            "Content-type": "application/json",
                        },
                    }
                    const user = await axios.post('http://localhost:5500/api/user/register', {name, email, password},config)
                    setAlert({boo: true, value: 'Account created successfully', severity:'success'})
                    setUser(user.data.user)
                    setTimeout(()=>{
                        setAlert({boo: false})
                        navigate('/home')
                    }, 1000)
                    localStorage.setItem("token", user.data.token)
                    setName(''); setEmail(''); setPassword(''); setConfirmPassword(''); setUserName('');
                } catch (err) {

                    setAlert({boo: true, serverity: 'error', value: 'Something went wrong, account wasn\'t created'})
                    setTimeout(()=>{
                        setAlert({boo: false, serverity: '', value: ''})
                    }, 2500)
                }
            }
            else{
                setTimeout(()=>{
                    setAlert({boo:false})
                }, 2000)
                setAlert({boo: true, value: 'user with email already exists.', serverity:'error'})
            }
        } catch (err) {
            console.log(err)
            setTimeout(()=>{
                setAlert({boo:false})
            }, 2000)
            setAlert({boo: true, value: 'Something went wrong!!! check connection.', serverity:'error'})

        }

    };


    return (
    <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs" bg={'red'} >
            <CssBaseline />
            <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
            >
            {alert.boo && <Alert severity={alert.serverity} onClose={() => {setAlert(false)}} sx={{marginBottom: 2}}>{alert.value}</Alert>}

            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                {/* nothing */}
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: '.75rem' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                        autoComplete="given-name"
                        name="name"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        required
                        fullWidth
                        id="name"
                        label="Name"
                        autoFocus
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        autoComplete="given-name"
                        name="userName"
                        value={userName}
                        onChange={(e)=>setUserName(e.target.value)}
                        required
                        fullWidth
                        id="userName"
                        label="User Name"
                        // autoFocus
                        />
                    </Grid>
                    <Grid item xs={12}  >
                        <TextField
                        required
                        fullWidth
                        id="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        />
                        
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        required
                        fullWidth
                        name="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                        required
                        fullWidth
                        name="confrimPassword"
                        value={confirmPassword}
                        onChange={(e)=>setConfirmPassword(e.target.value)}
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        />
                    </Grid>
                    {/* <Grid item xs={12}>
                        <FormControlLabel
                        control={<Checkbox value="allowExtraEmails" color="primary" />}
                        label="I want to receive inspiration, marketing promotions and updates via email."
                        />
                    </Grid> */}
                </Grid>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Sign Up </Button>
                <Grid container justifyContent="flex-end">
                <Grid item xs={12} sx={{display: 'grid', placeItems: 'center'}}>
                    <Link href={'/login'} variant="body2">
                    Already have an account? Sign in
                    </Link>
                </Grid>
                </Grid>
            </Box>
            </Box>
            {/* <Copyright sx={{ mt: 5 }} /> */}
        </Container>
    </ThemeProvider>
    );
}