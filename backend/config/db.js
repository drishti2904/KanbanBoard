import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      dbName: 'todo_board_db',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(' MongoDB Connected to todo_board_db');
  } catch (error) {
    console.error(' MongoDB connection error:', error);
    process.exit(1);
  }
};
