// middlewares/permissionMiddleware.js
import pool from "../db.js";

export const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id; // populated from auth middleware

      // ✅ Shortcut: if user has admin bypass
      if (req.user.has_admin_access) {
        return next();
      }

      // 1. Get user's role
      const [user] = await pool/*pool*/`
        SELECT role_id 
        FROM users 
        WHERE id = ${userId}
      `;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized: user not found" });
      }

      // 2. Check if role has the required permission
      const result = await pool/*pool*/`
        SELECT 1 
        FROM role_has_permissions rhp
        JOIN permissions p ON rhp.permission_id = p.id
        WHERE rhp.role_id = ${user.role_id}
        AND p.name = ${permissionName}
        LIMIT 1
      `;

      if (result.length === 0) {
        return res.status(403).json({ message: "Forbidden: No permission" });
      }

      // ✅ Allowed
      next();
    } catch (err) {
      console.error("Permission check failed:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
};
