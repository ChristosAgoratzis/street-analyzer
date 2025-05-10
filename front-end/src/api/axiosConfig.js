import axios from 'axios';

export default axios.create({
    baseURL:'http://localhost:80/',
    headers: { 'Content-Type': 'application/json'}
});