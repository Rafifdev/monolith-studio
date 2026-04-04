import { io } from "socket.io-client";

// Connect to the backend server
const URL = "http://localhost:3001";
export const socket = io(URL, {
  autoConnect: false, // We'll connect manually or auto? Auto is fine but let's do it on component mount
});
