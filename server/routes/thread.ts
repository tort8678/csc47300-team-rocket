import { Router } from 'express';
import { ThreadController } from '../controllers/thread.ts';
import { authenticate, optionalAuthenticate, requireAdmin } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';
import { getFileFromGridFS, getFileInfoFromGridFS } from '../services/gridfs.ts';

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
router.get('/admin/pending', authenticate, requireAdmin, ThreadController.getPendingThreads);
router.get('/admin/stats', authenticate, requireAdmin, ThreadController.getThreadStats);
router.post('/admin/:threadId/approve', authenticate, requireAdmin, ThreadController.approveThread);
router.post('/admin/:threadId/reject', authenticate, requireAdmin, ThreadController.rejectThread);

export default router;
