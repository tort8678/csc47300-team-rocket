import { Router } from 'express';
import { ThreadController } from '../controllers/thread.js';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { UserRole } from '../types/index.js';
import { getFileFromGridFS, getFileInfoFromGridFS } from '../services/gridfs.js';

const router = Router();

// Public routes
router.get('/', optionalAuthenticate, ThreadController.getThreads);
router.get('/stats/public', ThreadController.getPublicStats);
router.get('/attachments/:fileId/info', ThreadController.getAttachmentInfo);
router.get('/attachments/:fileId', ThreadController.getAttachment);
// This route must come after /attachments/:fileId to avoid conflicts
router.get('/:threadId', optionalAuthenticate, ThreadController.getThreadById);

// Protected routes
router.post('/', authenticate, upload.array('files', 5), ThreadController.createThread);
router.put('/:threadId', authenticate, upload.array('files', 5), ThreadController.updateThread);
router.delete('/:threadId', authenticate, ThreadController.deleteThread);
router.post('/:threadId/like', authenticate, ThreadController.toggleLikeThread);

// Admin routes
router.get('/admin/pending', authenticate, authorize(UserRole.ADMIN), ThreadController.getPendingThreads);
router.get('/admin/stats', authenticate, authorize(UserRole.ADMIN), ThreadController.getThreadStats);
router.post('/admin/:threadId/approve', authenticate, authorize(UserRole.ADMIN), ThreadController.approveThread);
router.post('/admin/:threadId/reject', authenticate, authorize(UserRole.ADMIN), ThreadController.rejectThread);

export default router;
