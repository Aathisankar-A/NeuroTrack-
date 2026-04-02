import api from './axios';

export const getCollections = () => api.get('/resources/collections');
export const createCollection = (data) => api.post('/resources/collections', data);

export const getResources = (collectionId) => api.get(`/resources/${collectionId}`);
export const addResource = (data) => api.post('/resources', data);
