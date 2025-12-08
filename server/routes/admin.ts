import { Router } from 'express';
import { AdminController } from '../controllers/admin.ts';
import { authenticate, requireAdmin, requireAdminLevel2 } from '../middleware/auth.ts';
import { UserRole } from '../types/index.ts';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// User CRUD routes
router.get('/users', requireAdmin, AdminController.getUsers);
router.get('/users/:userId', requireAdmin, AdminController.getUser);
router.post('/users', requireAdminLevel2, AdminController.createAdmin); // Only Admin Level 2 can create admins
router.put('/users/:userId', requireAdmin, AdminController.updateUser);
router.delete('/users/:userId', requireAdminLevel2, AdminController.deleteUser); // Only Admin Level 2 can delete
router.post('/users/:userId/restore', requireAdminLevel2, AdminController.restoreUser); // Only Admin Level 2 can restore
router.post('/users/:userId/ban', requireAdmin, AdminController.banUser); // Any admin can ban (with permission checks)
router.post('/users/:userId/unban', requireAdmin, AdminController.unbanUser); // Any admin can unban (with permission checks)

// Thread CRUD routes
router.get('/threads', requireAdmin, AdminController.getThreads);
router.get('/threads/:threadId', requireAdmin, AdminController.getThread);
router.put('/threads/:threadId', requireAdmin, AdminController.updateThread);
router.delete('/threads/:threadId', requireAdminLevel2, AdminController.deleteThread); // Only Admin Level 2 can delete
router.post('/threads/:threadId/restore', requireAdminLevel2, AdminController.restoreThread); // Only Admin Level 2 can restore

// Comment CRUD routes
router.get('/comments', requireAdmin, AdminController.getComments);
router.get('/comments/:commentId', requireAdmin, AdminController.getComment);
router.put('/comments/:commentId', requireAdmin, AdminController.updateComment);
router.delete('/comments/:commentId', requireAdminLevel2, AdminController.deleteComment); // Only Admin Level 2 can delete
router.post('/comments/:commentId/restore', requireAdminLevel2, AdminController.restoreComment); // Only Admin Level 2 can restore

export default router;

