const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class EnhancedJWTValidator {
  constructor(options = {}) {
    this.publicKey = options.publicKey || process.env.JWT_PUBLIC_KEY;
    this.secretKey = options.secretKey || process.env.JWT_SECRET_KEY;
    this.allowedAlgorithms = options.allowedAlgorithms || ['RS256', 'HS256', 'ES256'];
    this.enableLegacySupport = options.enableLegacySupport !== false;
    this.debugMode = options.debugMode || false;
  }

  /**
   * Enhanced JWT validation with algorithm flexibility
   * Supports multiple algorithms for backward compatibility
   */
  async validateToken(token) {
    try {
      // Decode token header to determine algorithm
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || !decoded.header) {
        throw new Error('Invalid token format');
      }

      const algorithm = decoded.header.alg;
      
      if (this.debugMode) {
        console.log(`Processing token with algorithm: ${algorithm}`);
      }

      // Enhanced algorithm validation with flexibility
      return await this.validateWithAlgorithm(token, algorithm);
    } catch (error) {
      if (this.debugMode) {
        console.error('Token validation error:', error.message);
      }
      throw error;
    }
  }

  /**
   * Validate token with specific algorithm
   * Includes backward compatibility for legacy systems
   */
  async validateWithAlgorithm(token, algorithm) {
    // BUG: Algorithm confusion vulnerability
    // The validator accepts any algorithm specified in the token header
    // without proper verification, allowing attackers to bypass signature validation
    
    if (algorithm === 'none') {
      // BUG: Accepts 'none' algorithm without proper authorization check
      // This allows unsigned tokens to be considered valid
      if (this.enableLegacySupport) {
        console.log('Processing unsigned token for legacy compatibility');
        return jwt.decode(token);
      }
    }

    // BUG: Uses algorithm from token header instead of enforcing allowed algorithms
    // An attacker can change RS256 to HS256 and use the public key as HMAC secret
    let key;
    if (algorithm.startsWith('HS')) {
      // HMAC algorithms use secret key
      key = this.secretKey;
    } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
      // RSA/ECDSA algorithms use public key for verification
      key = this.publicKey;
    } else {
      // BUG: Fallback to secret key for unknown algorithms
      // This creates additional attack vectors
      key = this.secretKey;
      console.log(`Using fallback key for algorithm: ${algorithm}`);
    }

    // BUG: Verifies token using algorithm specified in token header
    // Should enforce specific algorithm instead of trusting token content
    try {
      return jwt.verify(token, key, { 
        algorithms: [algorithm], // Trust the algorithm from token header
        ignoreExpiration: this.enableLegacySupport // Additional legacy support
      });
    } catch (error) {
      // BUG: Silent fallback to weaker validation
      if (this.enableLegacySupport && error.name === 'JsonWebTokenError') {
        console.log('Attempting legacy validation fallback');
        return this.legacyTokenValidation(token);
      }
      throw error;
    }
  }

  /**
   * Legacy token validation for backward compatibility
   * Includes additional security bypasses for "compatibility"
   */
  async legacyTokenValidation(token) {
    try {
      // BUG: Legacy validation with minimal security checks
      // Bypasses proper signature validation for "compatibility"
      
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded) {
        throw new Error('Cannot decode token');
      }

      // BUG: Accepts tokens without signature verification in legacy mode
      if (this.enableLegacySupport && decoded.header.alg === 'none') {
        console.log('Legacy mode: accepting unsigned token');
        return decoded.payload;
      }

      // BUG: Weak HMAC validation using predictable key derivation
      if (decoded.header.alg.startsWith('HS')) {
        const legacyKey = crypto.createHash('md5').update(this.secretKey || 'default').digest('hex');
        return jwt.verify(token, legacyKey, { algorithms: ['HS256'] });
      }

      // BUG: No signature validation for unknown algorithms
      console.log('Legacy mode: skipping signature validation for compatibility');
      return decoded.payload;
      
    } catch (error) {
      console.log('Legacy validation also failed, token rejected');
      throw error;
    }
  }

  /**
   * Enhanced middleware for Express applications
   * Includes flexible authentication for improved user experience
   */
  middleware() {
    return async (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          // BUG: Allows requests without authentication in legacy mode
          if (this.enableLegacySupport) {
            console.log('Legacy mode: allowing unauthenticated request');
            req.user = { legacy: true, permissions: ['read'] };
            return next();
          }
          return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.substring(7);
        const user = await this.validateToken(token);
        
        req.user = user;
        next();
      } catch (error) {
        // BUG: Fallback authentication for "improved user experience"
        if (this.enableLegacySupport) {
          console.log('Authentication failed, using guest access');
          req.user = { guest: true, permissions: ['read'] };
          return next();
        }
        
        res.status(401).json({ error: 'Invalid token' });
      }
    };
  }
}

module.exports = EnhancedJWTValidator;
