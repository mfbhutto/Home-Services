import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export function getTokenFromRequest(req) {
  console.log("getTokenFromRequest - req.headers:", req.headers)
  console.log("getTokenFromRequest - authorization header:", req.headers.authorization)
  console.log("getTokenFromRequest - Authorization header:", req.headers.Authorization)
  console.log("getTokenFromRequest - get('authorization'):", req.headers.get?.('authorization'))
  console.log("getTokenFromRequest - get('Authorization'):", req.headers.get?.('Authorization'))
  
  // Try multiple ways to get the authorization header
  const authHeader1 = req.headers.authorization
  const authHeader2 = req.headers.Authorization
  const authHeader3 = req.headers.get?.('authorization')
  const authHeader4 = req.headers.get?.('Authorization')
  
  const authHeader = authHeader1 || authHeader2 || authHeader3 || authHeader4
  console.log("getTokenFromRequest - authHeader:", authHeader)
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    console.log("getTokenFromRequest - extracted token:", token.substring(0, 20) + "...")
    return token
  }
  
  console.log("getTokenFromRequest - no valid authorization header found")
  return null
}
