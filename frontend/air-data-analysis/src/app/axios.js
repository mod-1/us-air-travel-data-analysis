import axios from 'axios';

// Create an instance of axios with custom config
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/', // Replace with your API's base URL
  timeout: 100000, // Set a timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default apiClient;
