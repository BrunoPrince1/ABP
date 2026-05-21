import { Router } from 'express';
import { authController } from '../controllers/authController';
import { medicationController } from '../controllers/medicationController';
import { recordController, deviceController, notificationController } from '../controllers/iotController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// ─── Auth ─────────────────────────────────────────────────
router.post('/auth/register', authController.register);
router.post('/auth/login',    authController.login);
router.get('/auth/me',        authMiddleware, authController.me);

// ─── Medicamentos ─────────────────────────────────────────
router.get('/medications',        authMiddleware, medicationController.list);
router.get('/medications/:id',    authMiddleware, medicationController.getOne);
router.post('/medications',       authMiddleware, medicationController.create);
router.put('/medications/:id',    authMiddleware, medicationController.update);
router.delete('/medications/:id', authMiddleware, medicationController.remove);

// ─── Registros ────────────────────────────────────────────
router.get('/records/today',  authMiddleware, recordController.today);
router.get('/records',        authMiddleware, recordController.history);

// ─── Dispositivo ──────────────────────────────────────────
router.get('/device/status',                authMiddleware, deviceController.status);
router.post('/device/heartbeat',            deviceController.heartbeat);            // sem auth (device key)
router.post('/device/compartment-opened',   deviceController.compartmentOpened);   // sem auth (device key)

// ─── Notificações ─────────────────────────────────────────
router.get('/notifications',          authMiddleware, notificationController.list);
router.patch('/notifications/read-all', authMiddleware, notificationController.markAllRead);
router.patch('/notifications/:id/read', authMiddleware, notificationController.markRead);

export default router;
