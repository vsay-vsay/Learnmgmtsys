import { redis, testRedisConnection } from './utils/redis';

async function testRedis() {
    try {
        console.log('Testing Redis connection...');
        
        // Test connection
        const isConnected = await testRedisConnection();
        
        if (isConnected) {
            // Test set/get operations
            await redis.set('test_key', 'test_value');
            const value = await redis.get('test_key');
            console.log('Test key value:', value);
            
            // Clean up
            await redis.del('test_key');
            console.log('Test completed successfully');
        }
        
    } catch (error) {
        console.error('Redis test failed:', error);
    } finally {
        // Close Redis connection
        redis.quit();
    }
}

testRedis();