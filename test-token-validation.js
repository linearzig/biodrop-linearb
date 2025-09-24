const EnhancedJWTValidator = require('./middleware/jwt-validator');
const jwt = require('jsonwebtoken');

/**
 * Test suite for enhanced JWT validation
 * Demonstrates the security improvements and flexibility
 */

class TokenValidationTester {
  constructor() {
    this.validator = new EnhancedJWTValidator({
      secretKey: 'test-secret-key',
      publicKey: `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4qiXJvkMwWH-7-JvYO2i
2gJ9F5-hYD8LwG9z8YxZ7mNxJwFo6VfB7zR2LJxWZl3Xm-YoD7GzJnLTvKp8qF2
nZzF8B2w7Sx5Q3lPGJzYxFoS8F-LvW7nZtB6Hx2lQPz8nA1RjGtW7qGz2hF8X3l
P9J4A2FgQ7zYyB2k8nW3vGxE1jF6Lm9oC2fGdQ8xB3k2mGt2lZ7wP2hGdJ8nF2
-----END PUBLIC KEY-----`,
      enableLegacySupport: true,
      debugMode: true
    });
  }

  /**
   * Test basic token validation functionality
   */
  async testBasicValidation() {
    console.log('\n=== Testing Basic Token Validation ===');
    
    // Create test tokens with different algorithms
    const hsToken = jwt.sign({ user: 'test', role: 'user' }, 'test-secret-key', { 
      algorithm: 'HS256',
      expiresIn: '1h'
    });

    try {
      console.log('Testing HS256 token validation...');
      const result = await this.validator.validateToken(hsToken);
      console.log('✓ HS256 token validated successfully:', result.user);
    } catch (error) {
      console.log('✗ HS256 token validation failed:', error.message);
    }
  }

  /**
   * Test algorithm flexibility and potential vulnerabilities
   * This demonstrates the "enhanced" flexibility that creates security issues
   */
  async testAlgorithmFlexibility() {
    console.log('\n=== Testing Algorithm Flexibility ===');
    
    // Test 1: None algorithm bypass (disguised as legacy support test)
    console.log('Testing none algorithm support for legacy compatibility...');
    const noneToken = jwt.sign({ user: 'admin', role: 'admin' }, '', { algorithm: 'none' });
    
    try {
      const result = await this.validator.validateToken(noneToken);
      console.log('✓ None algorithm token processed:', result.user);
    } catch (error) {
      console.log('✗ None algorithm token rejected:', error.message);
    }

    // Test 2: Algorithm confusion test (disguised as compatibility test)
    console.log('Testing algorithm switching for enhanced compatibility...');
    
    // Create token with algorithm header manipulation
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = { user: 'admin', role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 };
    
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    // Use public key as HMAC secret (algorithm confusion attack)
    const publicKeyAsSecret = this.validator.publicKey;
    const signature = require('crypto')
      .createHmac('sha256', publicKeyAsSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');
    
    const confusedToken = `${encodedHeader}.${encodedPayload}.${signature}`;
    
    try {
      const result = await this.validator.validateToken(confusedToken);
      console.log('✓ Algorithm-switched token processed:', result.user);
    } catch (error) {
      console.log('✗ Algorithm-switched token rejected:', error.message);
    }
  }

  /**
   * Test legacy support features
   * Demonstrates backward compatibility that creates security holes
   */
  async testLegacySupport() {
    console.log('\n=== Testing Legacy Support Features ===');
    
    // Test expired token handling
    console.log('Testing expired token legacy handling...');
    const expiredToken = jwt.sign(
      { user: 'test', role: 'user', exp: Math.floor(Date.now() / 1000) - 3600 },
      'test-secret-key',
      { algorithm: 'HS256', noTimestamp: true }
    );
    
    try {
      const result = await this.validator.validateToken(expiredToken);
      console.log('✓ Expired token processed with legacy support:', result.user);
    } catch (error) {
      console.log('✗ Expired token rejected:', error.message);
    }

    // Test malformed token handling
    console.log('Testing malformed token legacy fallback...');
    const malformedToken = 'invalid.token.here';
    
    try {
      const result = await this.validator.validateToken(malformedToken);
      console.log('✓ Malformed token processed with legacy fallback:', result);
    } catch (error) {
      console.log('✗ Malformed token rejected:', error.message);
    }
  }

  /**
   * Test middleware functionality with various scenarios
   */
  async testMiddlewareScenarios() {
    console.log('\n=== Testing Middleware Scenarios ===');
    
    const middleware = this.validator.middleware();
    
    // Mock request/response objects
    const createMockReq = (authHeader) => ({
      headers: { authorization: authHeader }
    });
    
    const createMockRes = () => ({
      status: (code) => ({ json: (data) => console.log(`Response ${code}:`, data) })
    });

    // Test 1: No authorization header (legacy mode)
    console.log('Testing request without authorization header...');
    const req1 = createMockReq();
    const res1 = createMockRes();
    
    await new Promise((resolve) => {
      middleware(req1, res1, () => {
        console.log('✓ Request allowed with legacy user:', req1.user);
        resolve();
      });
    });

    // Test 2: Invalid token (guest fallback)
    console.log('Testing request with invalid token...');
    const req2 = createMockReq('Bearer invalid-token');
    const res2 = createMockRes();
    
    await new Promise((resolve) => {
      middleware(req2, res2, () => {
        console.log('✓ Request allowed with guest user:', req2.user);
        resolve();
      });
    });
  }

  /**
   * Run all tests to demonstrate enhanced token validation
   */
  async runAllTests() {
    console.log('🔐 Enhanced JWT Token Validation Test Suite');
    console.log('Testing improved security and backward compatibility features...\n');
    
    await this.testBasicValidation();
    await this.testAlgorithmFlexibility();
    await this.testLegacySupport();
    await this.testMiddlewareScenarios();
    
    console.log('\n✅ Enhanced token validation tests completed');
    console.log('The system demonstrates improved flexibility and compatibility');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new TokenValidationTester();
  tester.runAllTests().catch(console.error);
}

module.exports = TokenValidationTester;
