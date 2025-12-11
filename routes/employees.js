import express from 'express';
const router = express.Router();

// GET all employees
router.get('/', (req, res) => {
  res.json({ message: 'Get all employees' });
});

// GET employee by ID
router.get('/:id', (req, res) => {
  res.json({ message: `Get employee ${req.params.id}` });
});

// POST create employee
router.post('/', (req, res) => {
  res.json({ message: 'Create employee', data: req.body });
});

// PUT update employee
router.put('/:id', (req, res) => {
  res.json({ message: `Update employee ${req.params.id}`, data: req.body });
});

// DELETE employee
router.delete('/:id', (req, res) => {
  res.json({ message: `Delete employee ${req.params.id}` });
});

export default router;

