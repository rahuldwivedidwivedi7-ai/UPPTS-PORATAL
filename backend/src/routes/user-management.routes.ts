import { Router } from 'express';
import { userManagementController } from '../controllers/user-management.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import multer from 'multer';

// Memory storage for Excel parsing
const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only Excel files are allowed.'));
    }
  }
});

const router = Router();

// All user management routes require authentication and SUPER_ADMIN role
router.use(authMiddleware);
router.use(authorizeRoles('SUPER_ADMIN'));

router.get('/export', userManagementController.exportUsers);
router.get('/import/template', userManagementController.downloadTemplate);
router.post('/import/preview', excelUpload.single('file'), userManagementController.previewImport);
router.post('/import/confirm', userManagementController.confirmImport);

router.get('/', userManagementController.getUsers);
router.post('/', userManagementController.createUser);
router.put('/:id', userManagementController.editUser);
router.patch('/:id/reset-password', userManagementController.resetPassword);
router.delete('/:id', userManagementController.deleteUser);

export default router;
