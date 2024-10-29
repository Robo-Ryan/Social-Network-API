import { Request, Response } from 'express';
import { Thought, User } from '../models';

// Get all thoughts
export const getThoughts = async (req: Request, res: Response) => {
  try {
    const thoughts = await Thought.find();
    res.json(thoughts);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Get a single thought by _id
export const getSingleThought = async (req: Request, res: Response) => {
  try {
    const thought = await Thought.findById(req.params.thoughtId);
    if (!thought) {
      res.status(404).json({ message: 'No thought with that ID' });
      return;
    }
    res.json(thought);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Create a new thought
export const createThought = async (req: Request, res: Response) => {
  try {
    const thought = await Thought.create(req.body);
    // Push the thought's _id to the associated user's thoughts array
    await User.findByIdAndUpdate(req.body.userId, {
      $push: { thoughts: thought._id },
    });
    res.json(thought);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Update a thought by _id
export const updateThought = async (req: Request, res: Response) => {
  try {
    const thought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      req.body,
      { new: true }
    );
    if (!thought) {
      res.status(404).json({ message: 'No thought with that ID' });
      return;
    }
    res.json(thought);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Delete a thought by _id
export const deleteThought = async (req: Request, res: Response) => {
  try {
    const thought = await Thought.findByIdAndDelete(req.params.thoughtId);
    if (!thought) {
      res.status(404).json({ message: 'No thought with that ID' });
      return;
    }
    // Remove the thought's _id from the associated user's thoughts array
    await User.findOneAndUpdate(
      { username: thought.username },
      { $pull: { thoughts: req.params.thoughtId } }
    );
    res.json({ message: 'Thought deleted' });
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Add a reaction to a thought
export const addReaction = async (req: Request, res: Response) => {
  try {
    const thought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      { $push: { reactions: req.body } },
      { new: true }
    );
    if (!thought) {
      res.status(404).json({ message: 'No thought with that ID' });
      return;
    }
    res.json(thought);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Remove a reaction from a thought
export const removeReaction = async (req: Request, res: Response) => {
  try {
    const thought = await Thought.findByIdAndUpdate(
      req.params.thoughtId,
      {
        $pull: { reactions: { reactionId: req.params.reactionId } },
      },
      { new: true }
    );
    if (!thought) {
      res.status(404).json({ message: 'No thought with that ID' });
      return;
    }
    res.json(thought);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Helper function to handle errors
const handleError = (err: unknown, res: Response) => {
  if (err instanceof Error) {
    res.status(500).json({ error: err.message });
  } else {
    res.status(500).json({ error: 'Unknown error occurred' });
  }
};