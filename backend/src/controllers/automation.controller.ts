import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../types';
import { n8nService } from '../services/n8n.service';
import { openClawService } from '../services/openclaw.service';
import { env } from '../config/env';

export const testOpenClawConnection = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testResult = await openClawService.testConnection();

    res.status(200).json({
      success: true,
      data: testResult,
    });
  } catch (error: any) {
    console.error('[testOpenClawConnection Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error testing local OpenClaw connection: ' + error.message,
    });
  }
};

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
      error: 'Error testing n8n connection: ' + error.message,
    });
  }
};

export const getCredentials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
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
      error: 'Error fetching credentials: ' + error.message,
    });
  }
};

export const upsertCredential = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const { serviceName, keyName, credentialKey, encryptedSecret, metadata } = req.body;

    if (!serviceName || !keyName || !credentialKey) {
      res.status(400).json({
        success: false,
        error: 'serviceName, keyName, and credentialKey are required.',
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
      message: 'Credential saved successfully',
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
      error: 'Error updating credential: ' + error.message,
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
      taskDescription: taskDescription || 'Manual test request from Sleeply UI',
      operatingMode: mode === 'sleep' ? 'sleep' : 'awake',
      timestamp: new Date().toISOString(),
      contextData,
    });

    res.status(200).json({
      success: true,
      message: dispatchResult.dispatched
        ? 'Workflow triggered successfully to n8n'
        : 'Simulated/queued trigger (n8n not accessible at this moment)',
      dispatchResult,
    });
  } catch (error: any) {
    console.error('[TriggerWorkflow Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error triggering automation workflow: ' + error.message,
    });
  }
};
