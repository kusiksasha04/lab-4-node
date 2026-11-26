import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

export async function getTasks() {
  const response = await api.get('/tasks');
  return response.data;
}

export async function createTask(task) {
  const response = await api.post('/tasks', task);
  return response.data;
}

export async function updateTask(id, changes) {
  const response = await api.patch(`/tasks/${id}`, changes);
  return response.data;
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}`);
}
