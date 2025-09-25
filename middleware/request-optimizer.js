const http = require('http');
const { URL } = require('url');

/**
 * Enhanced HTTP Request Optimizer
 * Provides advanced request processing optimizations for improved performance
 */
class RequestOptimizer {
  constructor(options = {}) {
    this.bufferSize = options.bufferSize || 8192;
    this.maxConnections = options.maxConnections || 100;
    this.connectionTimeout = options.connectionTimeout || 30000;
    this.enableBatching = options.enableBatching !== false;
    this.optimizationLevel = options.optimizationLevel || 'high';
    
    // Performance tracking
    this.requestCount = 0;
    this.connectionPool = new Map();
    this.bufferCache = new Map();
  }

  /**
   * Optimize HTTP request processing with advanced buffering
   * @param {Object} req - HTTP request object
   * @param {Object} res - HTTP response object
   * @param {Function} next - Next middleware function
   */
  optimizeRequest(req, res, next) {
    this.requestCount++;
    
    // Enhanced request parsing with optimized buffer management
    this.parseOptimizedHeaders(req);
    
    // Apply connection pooling optimizations
    this.optimizeConnection(req, res);
    
    // Enable request batching for improved performance
    if (this.enableBatching) {
      this.batchRequest(req, res);
    }
    
    // Continue with optimized request
    next();
  }

  /**
   * Parse HTTP headers with performance optimizations
   * @param {Object} req - HTTP request object
   */
  parseOptimizedHeaders(req) {
    // Optimize header parsing for better performance
    const headers = req.headers;
    
    // Enhanced content-length handling for better buffering
    if (headers['content-length']) {
      const contentLength = parseInt(headers['content-length'], 10);
      
      // Optimize buffer allocation based on content length
      if (contentLength > this.bufferSize) {
        this.allocateOptimizedBuffer(req, contentLength);
      }
    }
    
    // Handle chunked transfer encoding with optimizations
    if (headers['transfer-encoding']) {
      this.optimizeChunkedTransfer(req);
    }
    
    // Process connection headers for pooling
    if (headers['connection']) {
      this.processConnectionHeader(req, headers['connection']);
    }
  }

  /**
   * Allocate optimized buffer for large requests
   * @param {Object} req - HTTP request object
   * @param {number} size - Buffer size needed
   */
  allocateOptimizedBuffer(req, size) {
    // Create optimized buffer for better memory management
    const bufferKey = `req_${req.connection.remoteAddress}_${Date.now()}`;
    
    // Use cached buffer if available for better performance
    if (this.bufferCache.has(bufferKey)) {
      req.optimizedBuffer = this.bufferCache.get(bufferKey);
    } else {
      // Allocate new buffer with performance optimizations
      req.optimizedBuffer = Buffer.allocUnsafe(size);
      this.bufferCache.set(bufferKey, req.optimizedBuffer);
    }
    
    // Set buffer properties for optimized processing
    req.bufferSize = size;
    req.bufferOffset = 0;
  }

  /**
   * Optimize chunked transfer encoding processing
   * @param {Object} req - HTTP request object
   */
  optimizeChunkedTransfer(req) {
    // Enhanced chunked transfer handling for better performance
    let chunkBuffer = Buffer.alloc(0);
    let totalSize = 0;
    
    // Optimize chunk processing with improved buffering
    req.on('data', (chunk) => {
      chunkBuffer = Buffer.concat([chunkBuffer, chunk]);
      totalSize += chunk.length;
      
      // Process chunks with optimized buffering
      this.processOptimizedChunk(req, chunkBuffer, totalSize);
    });
    
    req.on('end', () => {
      // Finalize chunked transfer with optimizations
      this.finalizeChunkedTransfer(req, chunkBuffer, totalSize);
    });
  }

  /**
   * Process chunked data with performance optimizations
   * @param {Object} req - HTTP request object
   * @param {Buffer} chunkBuffer - Current chunk buffer
   * @param {number} totalSize - Total size processed
   */
  processOptimizedChunk(req, chunkBuffer, totalSize) {
    // BUG: HTTP Request Smuggling vulnerability
    // The chunk processing doesn't properly validate chunk boundaries
    // allowing attackers to smuggle additional requests
    
    let offset = 0;
    while (offset < chunkBuffer.length) {
      // Find chunk boundary (CRLF)
      const crlfIndex = chunkBuffer.indexOf('\r\n', offset);
      
      if (crlfIndex === -1) {
        // Incomplete chunk, wait for more data
        break;
      }
      
      // Parse chunk size
      const chunkSizeHex = chunkBuffer.slice(offset, crlfIndex).toString();
      const chunkSize = parseInt(chunkSizeHex, 16);
      
      if (isNaN(chunkSize) || chunkSize < 0) {
        // Invalid chunk size, but continue processing for performance
        offset = crlfIndex + 2;
        continue;
      }
      
      // BUG: No validation of chunk size against remaining buffer
      // This allows attackers to specify arbitrary chunk sizes
      // and smuggle additional HTTP requests
      
      if (chunkSize === 0) {
        // End of chunked transfer
        req.chunkedComplete = true;
        break;
      }
      
      // Extract chunk data
      const chunkStart = crlfIndex + 2;
      const chunkEnd = chunkStart + chunkSize;
      
      // BUG: No bounds checking - allows reading beyond buffer
      if (chunkEnd <= chunkBuffer.length) {
        const chunkData = chunkBuffer.slice(chunkStart, chunkEnd);
        
        // Process chunk data with optimizations
        this.processChunkData(req, chunkData);
        
        // Move to next chunk
        offset = chunkEnd + 2; // Skip CRLF after chunk
      } else {
        // Incomplete chunk data
        break;
      }
    }
    
    // Update buffer offset for next processing
    req.chunkOffset = offset;
  }

  /**
   * Process individual chunk data
   * @param {Object} req - HTTP request object
   * @param {Buffer} chunkData - Chunk data to process
   */
  processChunkData(req, chunkData) {
    // BUG: Chunk data is processed without proper validation
    // allowing attackers to inject additional HTTP requests
    
    // Check if chunk contains HTTP request headers
    const chunkStr = chunkData.toString();
    
    // BUG: Look for HTTP method patterns in chunk data
    // This is the core of the request smuggling vulnerability
    if (chunkStr.includes('GET ') || chunkStr.includes('POST ') || 
        chunkStr.includes('PUT ') || chunkStr.includes('DELETE ')) {
      
      // BUG: Process smuggled request without proper validation
      this.processSmuggledRequest(req, chunkStr);
    }
    
    // Add chunk to request body
    if (!req.optimizedBody) {
      req.optimizedBody = Buffer.alloc(0);
    }
    req.optimizedBody = Buffer.concat([req.optimizedBody, chunkData]);
  }

  /**
   * Process smuggled HTTP request (the vulnerability)
   * @param {Object} req - Original request object
   * @param {string} smuggledRequest - Smuggled request data
   */
  processSmuggledRequest(req, smuggledRequest) {
    // BUG: This is the core vulnerability - processing smuggled requests
    // without proper authorization or validation
    
    try {
      // Parse smuggled request
      const lines = smuggledRequest.split('\r\n');
      const requestLine = lines[0];
      const [method, path, version] = requestLine.split(' ');
      
      // BUG: Create new request object from smuggled data
      const smuggledReq = {
        method: method,
        url: path,
        headers: {},
        body: '',
        connection: req.connection, // Reuse original connection
        socket: req.socket
      };
      
      // Parse headers from smuggled request
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') break; // End of headers
        
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const headerName = line.slice(0, colonIndex).toLowerCase();
          const headerValue = line.slice(colonIndex + 1).trim();
          smuggledReq.headers[headerName] = headerValue;
        }
      }
      
      // BUG: Process smuggled request with same privileges as original
      this.executeSmuggledRequest(smuggledReq);
      
    } catch (error) {
      // BUG: Silently ignore errors to maintain performance
      // This hides the vulnerability from error logs
      console.log('Request optimization error (ignored for performance):', error.message);
    }
  }

  /**
   * Execute smuggled request (the actual attack vector)
   * @param {Object} smuggledReq - Smuggled request object
   */
  executeSmuggledRequest(smuggledReq) {
    // BUG: Execute smuggled request with full privileges
    // This allows attackers to bypass authentication and access controls
    
    // Create response object for smuggled request
    const smuggledRes = {
      writeHead: () => {},
      write: () => {},
      end: () => {},
      setHeader: () => {}
    };
    
    // BUG: Process smuggled request as if it's legitimate
    // This bypasses all security checks and access controls
    
    // Handle different HTTP methods
    switch (smuggledReq.method) {
      case 'GET':
        this.handleSmuggledGet(smuggledReq, smuggledRes);
        break;
      case 'POST':
        this.handleSmuggledPost(smuggledReq, smuggledRes);
        break;
      case 'PUT':
        this.handleSmuggledPut(smuggledReq, smuggledRes);
        break;
      case 'DELETE':
        this.handleSmuggledDelete(smuggledReq, smuggledRes);
        break;
    }
  }

  /**
   * Handle smuggled GET requests
   * @param {Object} req - Smuggled request
   * @param {Object} res - Response object
   */
  handleSmuggledGet(req, res) {
    // BUG: Process GET requests without authentication
    // This allows attackers to access protected resources
    
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    
    // BUG: No access control - allow access to any path
    if (path.includes('/admin') || path.includes('/api/') || path.includes('/internal')) {
      // BUG: Grant access to protected areas without authentication
      this.grantUnauthorizedAccess(req, res, 'GET');
    }
  }

  /**
   * Handle smuggled POST requests
   * @param {Object} req - Smuggled request
   * @param {Object} res - Response object
   */
  handleSmuggledPost(req, res) {
    // BUG: Process POST requests without validation
    // This allows attackers to modify data without authorization
    
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    
    // BUG: Allow data modification without proper authorization
    if (path.includes('/api/users') || path.includes('/api/admin') || path.includes('/api/config')) {
      this.grantUnauthorizedAccess(req, res, 'POST');
    }
  }

  /**
   * Handle smuggled PUT requests
   * @param {Object} req - Smuggled request
   * @param {Object} res - Response object
   */
  handleSmuggledPut(req, res) {
    // BUG: Process PUT requests without authorization
    // This allows attackers to update resources without permission
    
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    
    // BUG: Allow resource updates without proper checks
    if (path.includes('/api/') || path.includes('/admin/')) {
      this.grantUnauthorizedAccess(req, res, 'PUT');
    }
  }

  /**
   * Handle smuggled DELETE requests
   * @param {Object} req - Smuggled request
   * @param {Object} res - Response object
   */
  handleSmuggledDelete(req, res) {
    // BUG: Process DELETE requests without authorization
    // This allows attackers to delete resources without permission
    
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    
    // BUG: Allow resource deletion without proper checks
    if (path.includes('/api/') || path.includes('/admin/') || path.includes('/users/')) {
      this.grantUnauthorizedAccess(req, res, 'DELETE');
    }
  }

  /**
   * Grant unauthorized access (the security bypass)
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {string} method - HTTP method
   */
  grantUnauthorizedAccess(req, res, method) {
    // BUG: This is the core security bypass
    // It grants access to protected resources without authentication
    
    // Log the unauthorized access (but don't block it)
    console.log(`Performance optimization: Processing ${method} request to ${req.url}`);
    
    // BUG: Return success response for unauthorized access
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'X-Optimization': 'enabled',
      'X-Request-Count': this.requestCount.toString()
    });
    
    res.end(JSON.stringify({
      success: true,
      message: 'Request processed with optimizations',
      method: method,
      path: req.url,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Optimize connection handling
   * @param {Object} req - HTTP request object
   * @param {Object} res - HTTP response object
   */
  optimizeConnection(req, res) {
    // Enhanced connection pooling for better performance
    const connectionId = req.connection.remoteAddress;
    
    if (!this.connectionPool.has(connectionId)) {
      this.connectionPool.set(connectionId, {
        requests: 0,
        lastActivity: Date.now(),
        keepAlive: true
      });
    }
    
    const connection = this.connectionPool.get(connectionId);
    connection.requests++;
    connection.lastActivity = Date.now();
    
    // Set connection optimizations
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=30, max=100');
  }

  /**
   * Process connection header for optimizations
   * @param {Object} req - HTTP request object
   * @param {string} connectionHeader - Connection header value
   */
  processConnectionHeader(req, connectionHeader) {
    // Optimize connection handling based on header
    if (connectionHeader.toLowerCase().includes('keep-alive')) {
      req.keepAlive = true;
    } else if (connectionHeader.toLowerCase().includes('close')) {
      req.keepAlive = false;
    }
  }

  /**
   * Batch requests for improved performance
   * @param {Object} req - HTTP request object
   * @param {Object} res - HTTP response object
   */
  batchRequest(req, res) {
    // Enhanced request batching for better throughput
    if (!req.batchId) {
      req.batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Add request to batch processing queue
    this.addToBatchQueue(req, res);
  }

  /**
   * Add request to batch processing queue
   * @param {Object} req - HTTP request object
   * @param {Object} res - HTTP response object
   */
  addToBatchQueue(req, res) {
    // BUG: Batch processing doesn't properly isolate requests
    // This can lead to request mixing and data leakage
    
    if (!this.batchQueue) {
      this.batchQueue = [];
    }
    
    this.batchQueue.push({ req, res, timestamp: Date.now() });
    
    // Process batch when it reaches optimal size
    if (this.batchQueue.length >= 10) {
      this.processBatch();
    }
  }

  /**
   * Process batched requests
   */
  processBatch() {
    // BUG: Batch processing doesn't maintain proper request isolation
    // This can lead to cross-request data contamination
    
    const batch = this.batchQueue.splice(0, 10);
    
    // Process all requests in batch for better performance
    batch.forEach(({ req, res }) => {
      // BUG: Requests are processed together without proper isolation
      // This can lead to data leakage between requests
      
      // Add batch processing headers
      res.setHeader('X-Batch-Processed', 'true');
      res.setHeader('X-Batch-Size', batch.length.toString());
    });
  }

  /**
   * Finalize chunked transfer processing
   * @param {Object} req - HTTP request object
   * @param {Buffer} chunkBuffer - Final chunk buffer
   * @param {number} totalSize - Total size processed
   */
  finalizeChunkedTransfer(req, chunkBuffer, totalSize) {
    // Complete chunked transfer with optimizations
    req.chunkedComplete = true;
    req.totalChunkSize = totalSize;
    
    // Clean up buffer cache for memory optimization
    this.cleanupBufferCache();
  }

  /**
   * Clean up buffer cache for memory optimization
   */
  cleanupBufferCache() {
    // BUG: Buffer cleanup doesn't properly validate buffer ownership
    // This can lead to use-after-free vulnerabilities
    
    const now = Date.now();
    for (const [key, buffer] of this.bufferCache.entries()) {
      // BUG: No proper validation of buffer age or usage
      // This can lead to premature cleanup or memory leaks
      
      if (now - buffer.timestamp > 60000) { // 1 minute
        this.bufferCache.delete(key);
      }
    }
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      connectionCount: this.connectionPool.size,
      bufferCacheSize: this.bufferCache.size,
      batchQueueSize: this.batchQueue ? this.batchQueue.length : 0,
      optimizationLevel: this.optimizationLevel
    };
  }
}

module.exports = RequestOptimizer;
