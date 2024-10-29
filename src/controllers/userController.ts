import { Request, Response } from 'express';
import { User, Thought } from '../models';

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().populate('friends').populate('thoughts');
    res.json(users);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Get a single user by _id
export const getSingleUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('friends')
      .populate('thoughts');
    if (!user) {
      res.status(404).json({ message: 'No user with that ID' });
      return;
    }
    res.json(user);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Update a user by _id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, req.body, {
      new: true,
    });
    if (!user) {
      res.status(404).json({ message: 'No user with that ID' });
      return;
    }
    res.json(user);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Delete a user by _id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      res.status(404).json({ message: 'No user with that ID' });
      return;
    }
    // BONUS: Remove user's associated thoughts
    await Thought.deleteMany({ username: user.username });
    res.json({ message: 'User and associated thoughts deleted' });
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Add a friend to user's friend list
export const addFriend = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $addToSet: { friends: req.params.friendId } },
      { new: true }
    ).populate('friends');
    if (!user) {
      res.status(404).json({ message: 'No user with that ID' });
      return;
    }
    res.json(user);
  } catch (err: unknown) {
    handleError(err, res);
  }
};

// Remove a friend from user's friend list
export const removeFriend = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $pull: { friends: req.params.friendId } },
      { new: true }
    ).populate('friends');
    if (!user) {
      res.status(404).json({ message: 'No user with that ID' });
      return;
    }
    res.json(user);
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