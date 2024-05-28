import mongoose from 'mongoose';

const uri = process.env.ATLAS_URI || '';

async function connectMongoDB() {
  try {
    // Connect the client to the server
    await mongoose.connect(uri);
    console.log('successfully connected to MongoDB!');
  } catch (err) {
    console.error(`connection error: ${err.message}`);
  }
}

export default connectMongoDB;
