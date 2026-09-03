import 'dotenv/config';
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT;

const startServer = async () => {

    // await connectDB();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })
}

startServer();

process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1);
});

process.on('uncaughtException', (err) => {
    console.log(`Uncaught Exception: ${err.message}`);
    process.exit(1);
});