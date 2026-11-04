import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../types';
import { n8nService } from '../services/n8n.service';
import { TaskOperatingMode, TaskStatus } from '@prisma/client';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        agent: true,
        executionLogs: {
          orderBy: { executedAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      tasks,
    });
  } catch (error: any) {
    console.error('[GetTasks Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener las tareas: ' + error.message,
    });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email || '';
    if (!userId) {
      res.status(401).json({ success: false, error: 'No autorizado' });
      return;
    }

    const { title, description, agentId, mode, priority } = req.body;

    if (!title || !description) {
      res.status(400).json({
        success: false,
        error: 'Título y descripción son obligatorios.',
      });
      return;
    }

    // Verify agent belongs to this user if provided
    let agent = null;
    if (agentId) {
      agent = await prisma.agent.findFirst({
        where: { id: agentId, userId },
      });
    }

    const task = await prisma.task.create({
      data: {
        userId,
        agentId: agent ? agent.id : null,
        title,
        description,
        mode: mode === 'sleep' ? TaskOperatingMode.SLEEP : TaskOperatingMode.AWAKE,
        priority: priority || 'medium',
        status: TaskStatus.IN_PROGRESS,
      },
      include: {
        agent: true,
      },
    });

    // Create initial log
    await prisma.taskExecutionLog.create({
      data: {
        taskId: task.id,
        status: 'INITIALIZED',
        message: `Tarea creada y asignada a ${agent ? agent.name : 'cola de agentes'}. Modo: ${task.mode}`,
      },
    });

    // Dispatch asynchronous trigger to n8n node orchestrator
    n8nService.dispatchToN8n({
      userId,
      userEmail,
      agentCode: agent ? agent.code : 'COWORKER',
      agentName: agent ? agent.name : 'Co-worker',
      taskTitle: task.title,
      taskDescription: task.description,
      operatingMode: task.mode === TaskOperatingMode.SLEEP ? 'sleep' : 'awake',
      timestamp: new Date().toISOString(),
    }).then(async (dispatchRes) => {
      await prisma.taskExecutionLog.create({
        data: {
          taskId: task.id,
          status: dispatchRes.dispatched ? 'N8N_DISPATCHED' : 'N8N_QUEUED_OFFLINE',
          message: dispatchRes.dispatched
            ? `Evento de ejecución transmitido con éxito al flujo n8n (HTTP ${dispatchRes.n8nStatus})`
            : `Servidor n8n no conectado activamente. Tarea registrada y lista para ejecución automática cuando se levante el webhook. (${dispatchRes.error || 'offline'})`,
          rawPayload: dispatchRes.responseBody || null,
        },
      });
    }).catch((err) => {
      console.warn('[Task n8n dispatch background err]:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Tarea registrada exitosamente',
      task,
    });
  } catch (error: any) {
    console.error('[CreateTask Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear la tarea: ' + error.message,
    });
  }
};
