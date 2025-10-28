/**
 * JARVIS OMEGA PROTOCOL - Performance Monitoring Middleware
 * Tracks request performance and logs slow queries
 */

const performanceMonitor = (req, res, next) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Store original end function
    const originalEnd = res.end;

    // Override end function to capture metrics
    res.end = function(...args) {
        // Calculate metrics
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();
        const memoryDelta = {
            heapUsed: ((endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024).toFixed(2),
            external: ((endMemory.external - startMemory.external) / 1024 / 1024).toFixed(2)
        };

        // Log performance data
        const performanceData = {
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            memoryDelta: `${memoryDelta.heapUsed}MB heap, ${memoryDelta.external}MB external`,
            timestamp: new Date().toISOString(),
            userAgent: req.get('user-agent'),
            ip: req.ip || req.connection.remoteAddress
        };

        // Log slow requests (> 1000ms)
        if (duration > 1000) {
            console.warn('⚠️  SLOW REQUEST:', performanceData);
        } else if (process.env.VERBOSE === 'true') {
            console.log('📊 Request:', performanceData);
        }

        // Add performance headers
        res.setHeader('X-Response-Time', `${duration}ms`);
        res.setHeader('X-Memory-Delta', `${memoryDelta.heapUsed}MB`);

        // Call original end function
        originalEnd.apply(res, args);
    };

    next();
};

// Memory monitoring
const memoryMonitor = () => {
    const usage = process.memoryUsage();
    return {
        rss: `${(usage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(usage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(usage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(usage.external / 1024 / 1024).toFixed(2)} MB`,
        arrayBuffers: `${(usage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`
    };
};

// CPU monitoring
const cpuMonitor = () => {
    const cpuUsage = process.cpuUsage();
    return {
        user: `${(cpuUsage.user / 1000000).toFixed(2)}s`,
        system: `${(cpuUsage.system / 1000000).toFixed(2)}s`
    };
};

// System health check
const healthCheck = () => {
    const uptime = process.uptime();
    const memory = memoryMonitor();
    const cpu = cpuMonitor();

    return {
        status: 'healthy',
        uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
        memory,
        cpu,
        nodeVersion: process.version,
        platform: process.platform,
        pid: process.pid
    };
};

// Request counter
let requestCount = 0;
let errorCount = 0;

const requestCounter = (req, res, next) => {
    requestCount++;
    
    res.on('finish', () => {
        if (res.statusCode >= 400) {
            errorCount++;
        }
    });
    
    next();
};

// Get statistics
const getStats = () => {
    return {
        totalRequests: requestCount,
        totalErrors: errorCount,
        errorRate: requestCount > 0 ? ((errorCount / requestCount) * 100).toFixed(2) + '%' : '0%',
        uptime: process.uptime(),
        memory: memoryMonitor(),
        cpu: cpuMonitor()
    };
};

// Performance logger
const logPerformance = () => {
    setInterval(() => {
        if (process.env.LOG_PERFORMANCE === 'true') {
            console.log('📊 Performance Stats:', {
                ...getStats(),
                timestamp: new Date().toISOString()
            });
        }
    }, 60000); // Log every minute
};

// Memory leak detector
const detectMemoryLeak = () => {
    let lastHeapUsed = process.memoryUsage().heapUsed;
    
    setInterval(() => {
        const currentHeapUsed = process.memoryUsage().heapUsed;
        const heapGrowth = currentHeapUsed - lastHeapUsed;
        const heapGrowthMB = (heapGrowth / 1024 / 1024).toFixed(2);
        
        if (heapGrowth > 50 * 1024 * 1024) { // 50MB growth
            console.warn('⚠️  POTENTIAL MEMORY LEAK:', {
                heapGrowth: `${heapGrowthMB}MB`,
                currentHeap: `${(currentHeapUsed / 1024 / 1024).toFixed(2)}MB`,
                timestamp: new Date().toISOString()
            });
        }
        
        lastHeapUsed = currentHeapUsed;
    }, 300000); // Check every 5 minutes
};

// Request rate limiter stats
const rateLimitStats = new Map();

const trackRateLimit = (ip) => {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    
    if (!rateLimitStats.has(ip)) {
        rateLimitStats.set(ip, []);
    }
    
    const requests = rateLimitStats.get(ip);
    requests.push(now);
    
    // Clean old requests
    const recentRequests = requests.filter(time => now - time < windowMs);
    rateLimitStats.set(ip, recentRequests);
    
    return recentRequests.length;
};

// Export middleware and utilities
module.exports = {
    performanceMonitor,
    requestCounter,
    memoryMonitor,
    cpuMonitor,
    healthCheck,
    getStats,
    logPerformance,
    detectMemoryLeak,
    trackRateLimit
};
