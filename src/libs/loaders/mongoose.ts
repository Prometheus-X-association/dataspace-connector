import mongoose from 'mongoose';

export async function loadMongoose() {
    const connect = await mongoose.connect(process.env.MONGO_URI);

    const connection = connect.connection;
    connection.on(
        'error',
        // eslint-disable-next-line
        console.error.bind(console, 'MongoDB connection error: ')
    );

    return connection;
}
