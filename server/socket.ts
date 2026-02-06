import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from '@/lib/db/database';
import { updateAuctionStatuses } from '@/lib/services/auction-updater';

const httpServer = createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
        return;
    }
    res.writeHead(200);
    res.end('Socket.io server running');
});

const allowedOrigins = process.env.CLIENT_URL
    ? [process.env.CLIENT_URL, 'http://localhost:3000']
    : ['http://localhost:3000'];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Initialize DB connection and background job
connectDB().then(() => {
    console.log('Connected to MongoDB in socket server');

    // Run update immediately on start
    updateAuctionStatuses();

    // Schedule periodic updates (every 60 seconds)
    setInterval(() => {
        updateAuctionStatuses();
    }, 60 * 1000);
}).catch(err => {
    console.error('Failed to connect to MongoDB in socket server:', err);
});

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join-auction', (auctionId: string) => {
        socket.join(`auction:${auctionId}`);
        console.log(`${socket.id} joined auction:${auctionId}`);
    });

    socket.on('leave-auction', (auctionId: string) => {
        socket.leave(`auction:${auctionId}`);
        console.log(`${socket.id} left auction:${auctionId}`);
    });

    socket.on('new-bid', (data: { auctionId: string; bid: { amount: number; bidder: string; timestamp: string } }) => {
        io.to(`auction:${data.auctionId}`).emit('bid-update', data.bid);
        console.log(`Bid placed on auction ${data.auctionId}: $${data.bid.amount}`);
    });

    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

httpServer.listen(Number(PORT), HOST, () => {
    console.log(`WebSocket server running on ${HOST}:${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
});

export { io };
