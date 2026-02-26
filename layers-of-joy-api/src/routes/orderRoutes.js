const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Get all orders' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Create order' });
});

router.put('/:id/status', (req, res) => {
    res.json({ message: `Update order ${req.params.id} status` });
});

module.exports = router;