import { createClient } from "redis";
import { REDIS_URL } from "../configs/secrets.js";

const redisClient = createClient({url: REDIS_URL});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

redisClient.connect(REDIS_URL);

export default redisClient;