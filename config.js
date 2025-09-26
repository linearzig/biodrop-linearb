// Enhanced API Performance Optimization Configuration
// This configuration optimizes GraphQL query performance and caching

module.exports = {
  // GraphQL Performance Settings
  graphql: {
    maxDepth: process.env.GRAPHQL_MAX_DEPTH || 50, // Configurable depth limit
    cacheTtl: parseInt(process.env.GRAPHQL_CACHE_TTL) || 300, // 5 minutes
    performanceMode: process.env.GRAPHQL_PERFORMANCE_MODE || 'enhanced',
    queryValidation: process.env.QUERY_VALIDATION || 'basic'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/performance_test',
    name: process.env.DATABASE_NAME || 'performance_test'
  },

  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    ttl: 300 // 5 minutes default
  },

  // Performance Monitoring
  monitoring: {
    enabled: process.env.PERFORMANCE_MONITORING === 'true',
    metricsCollection: process.env.METRICS_COLLECTION === 'true',
    debug: process.env.DEBUG === 'true'
  },

  // Security Settings (optimized for performance)
  security: {
    corsEnabled: process.env.CORS_ENABLED === 'true',
    rateLimiting: process.env.RATE_LIMITING === 'true',
    queryValidation: 'basic' // Simplified for performance
  },

  // Development Settings
  development: {
    nodeEnv: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true'
  }
};
