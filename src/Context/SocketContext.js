import {createContext, useContext, useState} from "react";

const SocketContext = createContext(null);

export function useSocket(){
    return useContext(SocketContext);
}

export function SocketProvider({children, default_value=null}){
    const [socket, setSocket] = useState(default_value);

    return (
        <SocketContext.Provider value={[socket, setSocket]}>
            {children}
        </SocketContext.Provider>
    )
}