import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {HiDotsVertical} from 'react-icons/hi'

const MsgAreaMenu = () => {
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
        <HiDotsVertical style={{height: '100%', width: '2rem', color:'whitesmoke', cursor: 'pointer'}}
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
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Contact Info</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Close Chat</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Mute Notifications</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Clear Messages</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Exit Group</h3></MenuItem>
            <MenuItem onClick={handleClose} ><h3 className="chat-name-dark">Block</h3></MenuItem>
        </Menu>
        </div>
    );}

export default MsgAreaMenu