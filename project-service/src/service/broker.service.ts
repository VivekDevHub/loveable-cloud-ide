import amqplib from 'amqplib';
import { env } from '../config/env.js';

let channel: amqplib.Channel | null = null;


export async function connectToMessageBroker() {
    try {
        const connection = await amqplib.connect(env.MESSAGE_BROKER_URL);
        channel = await connection.createChannel();
        console.log('Connected to message broker');
    } catch (err: any) {
        console.warn('[broker] message broker offline (local fallback):', err?.message || err);
    }
}

export async function publishMessage(queue: string, message: string) {
    if (!channel) {
        console.warn('[broker] message broker channel is not initialized, skipping publish');
        return;
    }

    /**
     * Publishes a message to the specified queue.
     */
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(message));
}
