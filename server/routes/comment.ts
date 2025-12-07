import { Router } from 'express';
import { CommentController } from '../controllers/comment.ts';
import { authenticate, optionalAuthenticate } from '../middleware/auth.ts';

const router = Router();

// Public routes
router.get('/thread/:threadId', optionalAuthenticate, CommentController.getThreadComments);

// Protected routes
router.post('/thread/:threadId', authenticate, CommentController.createComment);
router.put('/:commentId', authenticate, CommentController.updateComment);
router.delete('/:commentId', authenticate, CommentController.deleteComment);
router.post('/:commentId/like', authenticate, CommentController.toggleLikeComment);

export default router;
