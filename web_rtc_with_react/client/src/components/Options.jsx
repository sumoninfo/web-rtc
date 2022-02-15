import React, {useContext, useState}      from 'react';
import {
    Button,
    TextField,
    FormControl,
    FormHelperText,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    FormGroup, Paper, Container, Grid, Typography
}                                         from '@material-ui/core';
import {makeStyles}                       from '@material-ui/core/styles';
import {CopyToClipboard}                  from "react-copy-to-clipboard";
import {Assessment, Phone, PhoneDisabled} from "@material-ui/icons";
import {SocketContext}                    from "../SocketContext";

const useStyles = makeStyles((theme) => ({
    root         : {
        display      : 'flex',
        flexDirection: 'column',
    },
    gridContainer: {
        width                         : '100%',
        [theme.breakpoints.down('xs')]: {
            flexDirection: 'column',
        },
    },
    container    : {
        width                         : '600px',
        margin                        : '35px 0',
        padding                       : 0,
        [theme.breakpoints.down('xs')]: {
            width: '80%',
        },
    },
    margin       : {
        marginTop: 20,
    },
    padding      : {
        padding: 20,
    },
    paper        : {
        padding: '10px 20px',
        border : '2px solid black',
    },
}));

function Options({children}) {
    const {me, callAccepted, name, setName, callEnded, leaveCall, callUser} = useContext(SocketContext);

    const classes                 = useStyles();
    const [idToCall, setIdToCall] = useState('');

    return (
        <Container className={classes.container}>
            <Paper elevation={10} className={classes.paper}>
                <form className={classes.root} noValidate autoComplete="off">
                    <Grid container className={classes.container}>
                        <Grid className={classes.padding} item xs={12} md={6}>
                            <Typography gutterBottom variant="h6">Account Into</Typography>
                            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)}/>
                            <CopyToClipboard text={me} className={classes.margin}>
                                <Button variant="contained" color="primary" fullWidth
                                        startIcon={<Assessment fontSize="large"/>} className={classes.margin}>
                                    Copy Your ID
                                </Button>
                            </CopyToClipboard>
                        </Grid>

                        <Grid className={classes.padding} item xs={12} md={6}>
                            <Typography gutterBottom variant="h6">Make a call</Typography>
                            <TextField label="ID to Call" value={idToCall}
                                       onChange={(e) => setIdToCall(e.target.value)}/>

                            {callAccepted && !callEnded ? (
                                <Button variant="contained" color="secondary" fullWidth
                                        startIcon={<PhoneDisabled fontSize="large"/>} className={classes.margin}
                                        onClick={leaveCall}>
                                    Hang Up
                                </Button>
                            ) : (
                                 <Button variant="contained" color="primary" fullWidth
                                         startIcon={<Phone fontSize="large"/>} className={classes.margin}
                                         onClick={() => callUser(idToCall)}>
                                     Call
                                 </Button>
                             )}

                        </Grid>
                    </Grid>
                </form>
                {children}
            </Paper>
        </Container>
    );
}

export default Options;