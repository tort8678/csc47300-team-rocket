import { Router } from 'express';
import { CommentController } from '../controllers/comment.ts';
import { authenticate, optionalAuthenticate } from '../middleware/auth.ts';
import { upload } from '../middleware/upload.ts';

const router = Router();

// Public routes
router.get('/thread/:threadId', optionalAuthenticate, CommentController.getThreadComments);
router.get('/attachments/:fileId/info', CommentController.getAttachmentInfo);
router.get('/attachments/:fileId', CommentController.getAttachment);

// Protected routes
router.post('/thread/:threadId', authenticate, upload.array('files', 5), CommentController.createComment as any);
router.put('/:commentId', authenticate, upload.array('files', 5), CommentController.updateComment as any);
router.delete('/:commentId', authenticate, CommentController.deleteComment as any);
router.post('/:commentId/like', authenticate, CommentController.toggleLikeComment as any);

export default router;
