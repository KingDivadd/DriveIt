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
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios'
import {useNavigate} from 'react-router-dom'
import { ChatState } from '../contenxt/chatContext';

const defaultTheme = createTheme();

export default function Login() {
    const [userName, setUserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [alert, setAlert] = useState({boo: false, value: '', serverity: ''})
    const {user, setUser} = ChatState()

    const navigate = useNavigate()

    const handleSubmit = async(e) => {
        e.preventDefault();
        if (!email || !password) {
            setTimeout(() => {
                setAlert(false)
            }, 2500);
            setAlert({boo: true, value: 'Please fill all fields!!!', serverity: 'error'})
        }
        
        // logining in
        try {
            const res = await axios.post('http://localhost:5500/api/user/login', {email, password}, {
                headers: {
                    "Content-Type":"application/json"
                }
            })
            setTimeout(() => {
                setAlert(false)
                navigate('/home')
            }, 2000);
            setAlert({boo: true, value: 'Login Successfun', serverity: 'success'})
            console.log(res.data.user)
            setUser(res.data.user)

            localStorage.setItem("token", res.data.token)
            localStorage.setItem("id", res.data.user.id)
        } catch (err) {
            setTimeout(() => {
                setAlert(true)
            }, 2000);
            setAlert({boo: true, value: 'Opps. something went wrong, check internet connection', serverity: 'error'})     
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
                Login
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, padding: '.75rem' }}>
                <Grid container spacing={2}>
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
                        autoFocus
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
                    
                </Grid>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} > Login </Button>
                <Grid container justifyContent="flex-end">
                <Grid item xs={12} sx={{display: 'grid', placeItems: 'center'}}>
                    <Link href={'/'} variant="body2">
                    Don't have an account? Sign up
                    </Link>
                </Grid>
                </Grid>
            </Box>
            </Box>
        </Container>
    </ThemeProvider>
    );
}