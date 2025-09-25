const http = require('http');
const { URL } = require('url');

/**
 * Test script for HTTP Request Smuggling vulnerability
 * This script demonstrates how the vulnerability can be exploited
 */

class RequestSmugglingTester {
  constructor() {
    this.testResults = [];
    this.vulnerabilityFound = false;
  }

  /**
   * Test HTTP request smuggling vulnerability
   */
  async testRequestSmuggling() {
    console.log('🔍 Testing HTTP Request Smuggling vulnerability...\n');

    // Test 1: Basic request smuggling
    await this.testBasicSmuggling();

    // Test 2: Chunked transfer encoding smuggling
    await this.testChunkedSmuggling();

    // Test 3: Content-Length vs Transfer-Encoding confusion
    await this.testLengthEncodingConfusion();

    // Test 4: Multiple request smuggling
    await this.testMultipleRequestSmuggling();

    // Test 5: Authentication bypass
    await this.testAuthenticationBypass();

    // Display results
    this.displayResults();
  }

  /**
   * Test basic request smuggling
   */
  async testBasicSmuggling() {
    console.log('📋 Test 1: Basic Request Smuggling');
    
    const testPayload = `POST /api/admin/users HTTP/1.1\r\nHost: localhost\r\nContent-Length: 13\r\n\r\n{"admin": true}`;
    
    try {
      const result = await this.sendSmuggledRequest(testPayload);
      
      if (result.success) {
        console.log('✅ Basic smuggling successful');
        this.vulnerabilityFound = true;
        this.testResults.push({
          test: 'Basic Smuggling',
          status: 'VULNERABLE',
          details: 'Successfully smuggled POST request'
        });
      } else {
        console.log('❌ Basic smuggling failed');
        this.testResults.push({
          test: 'Basic Smuggling',
          status: 'SECURE',
          details: 'Request smuggling blocked'
        });
      }
    } catch (error) {
      console.log('⚠️  Basic smuggling test error:', error.message);
      this.testResults.push({
        test: 'Basic Smuggling',
        status: 'ERROR',
        details: error.message
      });
    }
    
    console.log('');
  }

  /**
   * Test chunked transfer encoding smuggling
   */
  async testChunkedSmuggling() {
    console.log('📋 Test 2: Chunked Transfer Encoding Smuggling');
    
    const smuggledRequest = `GET /api/admin/config HTTP/1.1\r\nHost: localhost\r\n\r\n`;
    const chunkSize = smuggledRequest.length.toString(16);
    
    const testPayload = `POST /api/test HTTP/1.1\r\nHost: localhost\r\nTransfer-Encoding: chunked\r\n\r\n${chunkSize}\r\n${smuggledRequest}\r\n0\r\n\r\n`;
    
    try {
      const result = await this.sendSmuggledRequest(testPayload);
      
      if (result.success) {
        console.log('✅ Chunked smuggling successful');
        this.vulnerabilityFound = true;
        this.testResults.push({
          test: 'Chunked Smuggling',
          status: 'VULNERABLE',
          details: 'Successfully smuggled request via chunked encoding'
        });
      } else {
        console.log('❌ Chunked smuggling failed');
        this.testResults.push({
          test: 'Chunked Smuggling',
          status: 'SECURE',
          details: 'Chunked smuggling blocked'
        });
      }
    } catch (error) {
      console.log('⚠️  Chunked smuggling test error:', error.message);
      this.testResults.push({
        test: 'Chunked Smuggling',
        status: 'ERROR',
        details: error.message
      });
    }
    
    console.log('');
  }

  /**
   * Test Content-Length vs Transfer-Encoding confusion
   */
  async testLengthEncodingConfusion() {
    console.log('📋 Test 3: Content-Length vs Transfer-Encoding Confusion');
    
    const smuggledRequest = `GET /api/admin/users HTTP/1.1\r\nHost: localhost\r\n\r\n`;
    const smuggledLength = smuggledRequest.length;
    
    const testPayload = `POST /api/test HTTP/1.1\r\nHost: localhost\r\nContent-Length: ${smuggledLength}\r\nTransfer-Encoding: chunked\r\n\r\n${smuggledRequest}`;
    
    try {
      const result = await this.sendSmuggledRequest(testPayload);
      
      if (result.success) {
        console.log('✅ Length/Encoding confusion successful');
        this.vulnerabilityFound = true;
        this.testResults.push({
          test: 'Length/Encoding Confusion',
          status: 'VULNERABLE',
          details: 'Successfully exploited length/encoding confusion'
        });
      } else {
        console.log('❌ Length/Encoding confusion failed');
        this.testResults.push({
          test: 'Length/Encoding Confusion',
          status: 'SECURE',
          details: 'Length/Encoding confusion blocked'
        });
      }
    } catch (error) {
      console.log('⚠️  Length/Encoding confusion test error:', error.message);
      this.testResults.push({
        test: 'Length/Encoding Confusion',
        status: 'ERROR',
        details: error.message
      });
    }
    
    console.log('');
  }

  /**
   * Test multiple request smuggling
   */
  async testMultipleRequestSmuggling() {
    console.log('📋 Test 4: Multiple Request Smuggling');
    
    const smuggledRequests = [
      `GET /api/admin/config HTTP/1.1\r\nHost: localhost\r\n\r\n`,
      `POST /api/admin/users HTTP/1.1\r\nHost: localhost\r\nContent-Length: 13\r\n\r\n{"admin": true}`,
      `DELETE /api/admin/logs HTTP/1.1\r\nHost: localhost\r\n\r\n`
    ];
    
    const testPayload = `POST /api/test HTTP/1.1\r\nHost: localhost\r\nContent-Length: ${smuggledRequests.join('').length}\r\n\r\n${smuggledRequests.join('')}`;
    
    try {
      const result = await this.sendSmuggledRequest(testPayload);
      
      if (result.success) {
        console.log('✅ Multiple request smuggling successful');
        this.vulnerabilityFound = true;
        this.testResults.push({
          test: 'Multiple Request Smuggling',
          status: 'VULNERABLE',
          details: 'Successfully smuggled multiple requests'
        });
      } else {
        console.log('❌ Multiple request smuggling failed');
        this.testResults.push({
          test: 'Multiple Request Smuggling',
          status: 'SECURE',
          details: 'Multiple request smuggling blocked'
        });
      }
    } catch (error) {
      console.log('⚠️  Multiple request smuggling test error:', error.message);
      this.testResults.push({
        test: 'Multiple Request Smuggling',
        status: 'ERROR',
        details: error.message
      });
    }
    
    console.log('');
  }

  /**
   * Test authentication bypass
   */
  async testAuthenticationBypass() {
    console.log('📋 Test 5: Authentication Bypass');
    
    const testPayload = `GET /api/admin/sensitive-data HTTP/1.1\r\nHost: localhost\r\nAuthorization: Bearer fake-token\r\n\r\n`;
    
    try {
      const result = await this.sendSmuggledRequest(testPayload);
      
      if (result.success && result.authenticated) {
        console.log('✅ Authentication bypass successful');
        this.vulnerabilityFound = true;
        this.testResults.push({
          test: 'Authentication Bypass',
          status: 'VULNERABLE',
          details: 'Successfully bypassed authentication'
        });
      } else {
        console.log('❌ Authentication bypass failed');
        this.testResults.push({
          test: 'Authentication Bypass',
          status: 'SECURE',
          details: 'Authentication bypass blocked'
        });
      }
    } catch (error) {
      console.log('⚠️  Authentication bypass test error:', error.message);
      this.testResults.push({
        test: 'Authentication Bypass',
        status: 'ERROR',
        details: error.message
      });
    }
    
    console.log('');
  }

  /**
   * Send smuggled request to test endpoint
   * @param {string} payload - Smuggled request payload
   * @returns {Promise<Object>} Test result
   */
  async sendSmuggledRequest(payload) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/test-request-optimization',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          'Transfer-Encoding': 'chunked'
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve({
              success: true,
              statusCode: res.statusCode,
              response: response,
              authenticated: res.statusCode === 200
            });
          } catch (error) {
            resolve({
              success: false,
              statusCode: res.statusCode,
              error: error.message
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      // Send the smuggled request
      req.write(payload);
      req.end();
    });
  }

  /**
   * Display test results
   */
  displayResults() {
    console.log('📊 Test Results Summary');
    console.log('========================\n');

    let vulnerableCount = 0;
    let secureCount = 0;
    let errorCount = 0;

    this.testResults.forEach((result, index) => {
      const status = result.status;
      const icon = status === 'VULNERABLE' ? '🔴' : 
                   status === 'SECURE' ? '🟢' : '🟡';
      
      console.log(`${index + 1}. ${icon} ${result.test}: ${status}`);
      console.log(`   Details: ${result.details}\n`);

      if (status === 'VULNERABLE') vulnerableCount++;
      else if (status === 'SECURE') secureCount++;
      else errorCount++;
    });

    console.log('📈 Summary:');
    console.log(`   Vulnerable: ${vulnerableCount}`);
    console.log(`   Secure: ${secureCount}`);
    console.log(`   Errors: ${errorCount}\n`);

    if (this.vulnerabilityFound) {
      console.log('🚨 VULNERABILITY DETECTED!');
      console.log('   The application is vulnerable to HTTP Request Smuggling attacks.');
      console.log('   This allows attackers to:');
      console.log('   - Bypass authentication');
      console.log('   - Access protected resources');
      console.log('   - Perform unauthorized actions');
      console.log('   - Potentially escalate privileges\n');
    } else {
      console.log('✅ No vulnerabilities detected');
      console.log('   The application appears to be secure against HTTP Request Smuggling attacks.\n');
    }

    console.log('🔧 Recommended Fixes:');
    console.log('   1. Validate and sanitize all HTTP headers');
    console.log('   2. Implement proper request parsing with strict validation');
    console.log('   3. Use a reverse proxy or load balancer with request validation');
    console.log('   4. Implement proper Content-Length and Transfer-Encoding handling');
    console.log('   5. Add request size limits and timeout controls');
    console.log('   6. Use HTTPS to prevent request manipulation');
    console.log('   7. Implement proper authentication and authorization checks');
    console.log('   8. Add request logging and monitoring for suspicious patterns\n');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new RequestSmugglingTester();
  tester.testRequestSmuggling().catch(console.error);
}

module.exports = RequestSmugglingTester;
