import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {HiDotsVertical} from 'react-icons/hi'

const HeaderMenu = ()=>{
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
        {/* <PiCaretDownBold onClick={handleClick}/> */}
        <HiDotsVertical size={'1.7rem'} color='whitesmoke' style={{cursor: 'pointer', height: '1.7rem', width: '1.7rem', marginBottom: '-.3rem'}}
            id="demo-positioned-button"
            aria-controls={open ? 'demo-positioned-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
        />
        <Menu  
            id="demo-positioned-menu"
            aria-labelledby="demo-positioned-button"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
            }}
            transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
            }}>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">New Group</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Muted Chats</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Stared Chats</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Select Chat</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Settings</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Log out</h3></MenuItem>
        </Menu>
        </div>
    );
}

export default HeaderMenu