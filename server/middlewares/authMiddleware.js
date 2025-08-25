import jwt from 'jsonwebtoken';
import 'dotenv/config'; 


export const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided or malformed header.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
export const isAdmin = (req,res,next)=>{
  if (req.user.has_admin_access) {
      return res.status(403).json({ message: "Only admins can create users" });
    }
    next();
}

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Not authorized" });
    }
    next();
  };
};
export default authMiddleware; 
