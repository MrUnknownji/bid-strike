import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
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

const PORT = process.env.SOCKET_PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`WebSocket server running on port ${PORT}`);
});

export { io };
