const express = require('express');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { search, category, status, sort = 'desc', page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const sortOrder = sort === 'asc' ? 1 : -1;
    const skip = (Number(page) - 1) * Number(limit);

    const notes = await Note.find(query)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Note.countDocuments(query);

    res.json({ notes, total, page: Number(page), limit: Number(limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, tags, status, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const note = await Note.create({
      title,
      content,
      category,
      tags: tags || [],
      status,
      isPinned,
      userId: req.user._id
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note', error: error.message });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note', error: error.message });
  }
});

module.exports = router;
