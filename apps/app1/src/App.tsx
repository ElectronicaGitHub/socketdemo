import { Box, Grid } from '@material-ui/core';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

enum USER_STATUS {
  NOT_FILLED = 'not filled',
  PENDING = 'pending',
  FILLED = 'filled'
}

const COLORS: {[key: string]: string} = {
  [USER_STATUS.NOT_FILLED]: 'red',
  [USER_STATUS.PENDING]: 'gold',
  [USER_STATUS.FILLED]: 'green'
}

interface User {
  name: string;
  id: number;
  data?: Lesion[];
  status: USER_STATUS;
}
interface Lesion {
  label: string;
}

interface SocketData {
  user: Omit<User, 'data'>;
  data?: Lesion[];
  command?: 'submit';
}

const initialValue: User[] = [
  {
    name: 'Vasiliy Kuznezov',
    id: 1,
    status: USER_STATUS.NOT_FILLED
  },
  {
    name: 'Ivan Drago',
    id: 2,
    status: USER_STATUS.NOT_FILLED
  },
  {
    name: 'Sonya Vasilieva',
    id: 3,
    status: USER_STATUS.NOT_FILLED
  },
]

function App() {

  const [users, setUsers] = useState<User[]>(initialValue);
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const _socket = io('http://localhost:3131', { autoConnect: false });
    setSocket(_socket);
  }, []);

  const updateUser = ({ user, data }: SocketData) => {
    const index = users.findIndex(el => el.id === user.id);
    const _users = [...users];
    if (data) { _users[index].data = data; }
    if (user?.status) { _users[index].status = user.status; }
    setUsers(_users);
  }

  const connectSocket = () => {
    if (!socket?.connected) {
      socket?.connect();
    }
  }

  const onImageClick = (user: any) => {
    connectSocket();
    const connectionKey = String(+new Date());
    window.open(`http://localhost:5501?connectionKey=${connectionKey}`);
    initListener(connectionKey);
    initEmitter(connectionKey, user);
    updateUser({ user: { ...user, status: USER_STATUS.PENDING }});
  }

  const initEmitter = (connectionKey: string, user: any) => {
    const sid = 'readAIData';
    socket?.emit(sid, {
      connectionKey,
      user
    });
  }

  const initListener = (key: string) => {
    const sid = `readAIData/${key}`;
    socket?.on(sid, ({ command, ...data }: SocketData) => {
      if (command === 'submit') {
        return updateUser({ 
          ...data.data, 
          user: { 
            ...data.user, 
            status: USER_STATUS.FILLED
          }
        });
      }
      updateUser(data);
    });
  }

  return (
    <Grid container>
      { users.map((user) => (
        <Grid style={{ 
          border: '1px solid gray', 
          padding: '1rem', 
          borderRadius: '0.5rem', 
          marginRight: '.4rem',
          textAlign: 'center'
        }} item xs={2} key={user.id} onClick={() => onImageClick(user)}>
          <img style={{ height: '100px', width: '100px' }} src={`/images/img${user.id}.jpeg`}/>
          <Box mt={1} mb={1}>{user.name}</Box>
          <Box mt={1} mb={1} style={{
            color: COLORS[user.status],
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>{user.status}</Box>
          { user.data &&
            (<>
              <Box>Data:</Box>
              <Box>
                { user.data.map((el: Lesion, index: number) => (
                  <div key={index}>{el.label}</div>
                ))}
              </Box>
            </>)
          }
        </Grid>
      ))}
    </Grid>
  );
}

export default App;
