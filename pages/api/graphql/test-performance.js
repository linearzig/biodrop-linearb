// Test endpoint for Enhanced API Performance Optimization
// This endpoint demonstrates the performance improvements and optimization features

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { testType = 'basic' } = req.body;
    
    // Test queries to demonstrate performance optimization
    const testQueries = {
      basic: `
        query {
          users {
            id
            username
            email
          }
        }
      `,
      moderate: `
        query {
          users {
            id
            username
            email
            posts {
              id
              title
              content
            }
          }
        }
      `,
      complex: `
        query {
          users {
            id
            username
            email
            posts {
              id
              title
              content
              comments {
                id
                content
                author {
                  id
                  name
                  bio
                }
              }
            }
          }
        }
      `,
      deep: `
        query {
          users {
            id
            username
            email
            posts {
              id
              title
              content
              comments {
                id
                content
                author {
                  id
                  name
                  bio
                  settings {
                    theme
                    notifications
                    privacy
                    preferences
                    advanced
                    experimental
                    debug
                    performance
                  }
                }
              }
            }
          }
        }
      `,
      extreme: `
        query {
          users {
            id
            username
            email
            posts {
              id
              title
              content
              comments {
                id
                content
                author {
                  id
                  name
                  bio
                  settings {
                    theme
                    notifications
                    privacy
                    preferences
                    advanced
                    experimental
                    debug
                    performance
                  }
                }
              }
            }
          }
        }
      `
    };

    const query = testQueries[testType] || testQueries.basic;
    
    // Test the performance-optimized GraphQL endpoint
    const response = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/graphql/performance-optimized`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    
    // Return test results with performance analysis
    res.status(200).json({
      testType,
      queryDepth: calculateQueryDepth(query),
      performance: result.extensions?.performance || {},
      data: result.data,
      errors: result.errors,
      success: !result.errors,
      message: `Performance test completed for ${testType} query type`
    });
    
  } catch (error) {
    console.error('Performance Test Error:', error);
    res.status(500).json({ 
      error: 'Test failed',
      message: 'Performance test encountered an error',
      details: error.message
    });
  }
}

// Helper function to calculate query depth
function calculateQueryDepth(query) {
  let depth = 0;
  let currentDepth = 0;
  let inField = false;
  
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    
    if (char === '{') {
      if (inField) {
        currentDepth++;
        depth = Math.max(depth, currentDepth);
      }
      inField = true;
    } else if (char === '}') {
      if (inField) {
        currentDepth--;
      }
      inField = false;
    }
  }
  
  return depth;
}
