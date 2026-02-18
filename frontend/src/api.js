import axios from 'axios';

const API_URL = 'http://localhost:4000';

export function register(username, password) {
  return axios.post(`${API_URL}/register`, { username, password });
}

export function login(username, password) {
  return axios.post(`${API_URL}/login`, { username, password });
}

export function getHabits(token) {
  return axios.get(`${API_URL}/habits`, { headers: { Authorization: `Bearer ${token}` } });
}

export function addHabit(token, name) {
  return axios.post(`${API_URL}/habits`, { name }, { headers: { Authorization: `Bearer ${token}` } });
}

export function deleteHabit(token, id) {
  return axios.delete(`${API_URL}/habits/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}

export function completeHabit(token, id, date) {
  return axios.post(`${API_URL}/habits/${id}/complete`, { date }, { headers: { Authorization: `Bearer ${token}` } });
}

export function getCompletions(token, id) {
  return axios.get(`${API_URL}/habits/${id}/completions`, { headers: { Authorization: `Bearer ${token}` } });
}
