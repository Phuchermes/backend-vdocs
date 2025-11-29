const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

router.post('/:functionName', protect, async (req, res) => {
    try {
        const funcPath = path.join(__dirname, '../functions', req.params.functionName + '.js');
        if (!fs.existsSync(funcPath)) return res.status(404).json({ message: 'Function not found' });
        const func = require(funcPath);
        await func(req, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
