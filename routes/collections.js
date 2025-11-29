const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createCollection, getCollections, createDocument, getDocuments } = require('../controllers/collectionController');

router.post('/', protect, createCollection);
router.get('/', protect, getCollections);

router.post('/documents', protect, createDocument);
router.get('/:collectionId/documents', protect, getDocuments);

module.exports = router;
