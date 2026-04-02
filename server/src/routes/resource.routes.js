import express from 'express';
import ResourceController from '../controllers/resource.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All resource routes require authentication
router.use(protect);

router.post('/collections', ResourceController.createCollection);
router.get('/collections', ResourceController.getCollections);

router.post('/', ResourceController.addResource);
router.get('/:collectionId', ResourceController.getResourcesByCollection);

export default router;
