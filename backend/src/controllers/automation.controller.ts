import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../types';
import { n8nService } from '../services/n8n.service';
import { env } from '../config/env';

export const testN8nConnection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testResult = await n8nService.testConnection();

    res.status(200).json({
      success: true,
      data: testResult,
    });
  } catch (error: any) {
    console.error('[testN8nConnection Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al probar la conexión con n8n: ' + error.message,
    });
  }
};

export const getCredentials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const credentials = await prisma.integrationCredential.findMany({
      where: { userId },
      select: {
        id: true,
        serviceName: true,
        keyName: true,
        credentialKey: true,
        metadata: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      credentials,
    });
  } catch (error: any) {
    console.error('[GetCredentials Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener credenciales: ' + error.message,
    });
  }
};

export const upsertCredential = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const { serviceName, keyName, credentialKey, encryptedSecret, metadata } = req.body;

    if (!serviceName || !keyName || !credentialKey) {
      res.status(400).json({
        success: false,
        error: 'serviceName, keyName y credentialKey son requeridos.',
      });
      return;
    }

    const credential = await prisma.integrationCredential.upsert({
      where: {
        userId_serviceName_keyName: {
          userId,
          serviceName,
          keyName,
        },
      },
      update: {
        credentialKey,
        ...(encryptedSecret && { encryptedSecret }),
        ...(metadata && { metadata }),
        isActive: true,
      },
      create: {
        userId,
        serviceName,
        keyName,
        credentialKey,
        encryptedSecret: encryptedSecret || 'encrypted_token_placeholder',
        metadata: metadata || null,
        isActive: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Credencial guardada exitosamente',
      credential: {
        id: credential.id,
        serviceName: credential.serviceName,
        keyName: credential.keyName,
        credentialKey: credential.credentialKey,
        metadata: credential.metadata,
        isActive: credential.isActive,
      },
    });
  } catch (error: any) {
    console.error('[UpsertCredential Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar credencial: ' + error.message,
    });
  }
};

export const triggerWorkflow = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email || 'admin@sleeply.local';
    const { agentCode, taskTitle, taskDescription, mode, contextData } = req.body;

    const dispatchResult = await n8nService.dispatchToN8n({
      userId: userId || 'anonymous',
      userEmail,
      agentCode: agentCode || 'COWORKER',
      agentName: 'Sleeply Autonomous Agent',
      taskTitle: taskTitle || 'Test Workflow Trigger',
      taskDescription: taskDescription || 'Petición manual de prueba desde Sleeply UI',
      operatingMode: mode === 'sleep' ? 'sleep' : 'awake',
      timestamp: new Date().toISOString(),
      contextData,
    });

    res.status(200).json({
      success: true,
      message: dispatchResult.dispatched
        ? 'Flujo disparado exitosamente hacia n8n'
        : 'Disparo simulado/encolado (n8n no accesible en este instante)',
      dispatchResult,
    });
  } catch (error: any) {
    console.error('[TriggerWorkflow Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al disparar el flujo de automatización: ' + error.message,
    });
  }
};
