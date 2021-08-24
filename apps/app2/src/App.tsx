import { Box, Button, Grid, TextField } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Lesion {
  label: string;
}

function App() {

  const [socket, setSocket] = useState<Socket>();
  const [connectionKey, setConnectionKey] = useState<string>();
  const [user, setUser] = useState<any>();
  const [data, setData] = useState<Lesion[]>([{
    label: ''
  }]);

  const addNewData = () => {
    setData([...data, { label: ''}]);
  }

  const onSubmit = () => {
    socket?.emit('command', { command: 'submit', connectionKey });
    window.close();
  }

  const onChangeData = (field: string, value: string, index: number) => {
    const arr = [...data];
    // @ts-ignore
    arr[index][field] = value;

    setData(arr);
  }

  useEffect(() => {
    const _socket = io('http://localhost:3131');
    setSocket(_socket);
  }, []);

  useEffect(() => {
    emitData(data);
  }, [data]);

  useEffect(() => {
    const key = window.location.href.split('?')[1]?.split('=')[1];
    setConnectionKey(key);
  }, []);

  useEffect(() => {
    if (!connectionKey) return;
    initListener();

  }, [connectionKey]);

  const initListener = () => {
    const sid = `readAIData/${connectionKey}`;
    socket?.on(sid, ({ user, data }) => {
      if (user) {
        setUser(user);
      }
      if (data) {
        setData(data);
      }
    });
    socket?.emit('command', { command: 'getData', connectionKey });
  }

  const emitData = (data: any) => {
    const sid = `readAIData`;
    socket?.emit(sid, {
      connectionKey,
      data
    });
  }

  return (<>
    <div>app2</div>
    <Grid container>
      { user 
        ? <Grid item>
            Loaded user: {user.name} ({user.id})
          </Grid> 
        : null
      }
    </Grid>

    <Grid container>
      { data.map((lesion: Lesion, index: number) => (
          <Grid item xs={12} key={index}>
            <Box mt={1}>
              <TextField 
                value={lesion.label} 
                name='label'
                color='primary'
                variant='outlined'
                label='lesion label'
                onChange={(event: any) => onChangeData('label', event?.target.value, index)}
              />
            </Box>
          </Grid>
        ))
      }
    </Grid>
    <Box mt={2}>
      <Button variant='contained' color='default' onClick={addNewData}>
        Add new lesion
      </Button>
    </Box>

    <Box mt={2}>
      <Button variant='contained' color='primary' onClick={onSubmit}>
        Submit
      </Button>
    </Box>
  </>);
}

export default App;
