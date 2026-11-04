import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../database/prisma';
import { env } from '../config/env';
import { AuthRequest } from '../types';
import { AgentCode, UserRole } from '@prisma/client';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: 'Todos los campos (email, contraseña, nombre) son requeridos.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: 'Ya existe un usuario registrado con este correo electrónico.',
      });
      return;
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in a transaction with initial office and the 3 specialized agents
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          name: name.trim(),
          role: UserRole.CEO,
        },
      });

      // Create default primary office
      await tx.office.create({
        data: {
          userId: user.id,
          name: 'Oficina Central Sleeply',
          currentMode: 'DAY',
          selectedAvatarId: 'char_0',
          zoomLevel: 1.0,
          isGridVisible: false,
        },
      });

      // Create the 3 Core AI Agents per Sleeply specification
      await tx.agent.createMany({
        data: [
          {
            userId: user.id,
            code: AgentCode.COWORKER,
            name: 'Co-worker',
            description: 'Ejecuta tareas técnicas asignadas y avanza entregables de proyectos.',
            avatar: 'char_1',
            status: 'IDLE',
            instructions: 'Especialista en código, automatización y desarrollo de requerimientos.',
          },
          {
            userId: user.id,
            code: AgentCode.ASSISTANT,
            name: 'Asistente / Secretaria',
            description: 'Organiza correos, mensajes, información clave y agenda operativa.',
            avatar: 'char_2',
            status: 'IDLE',
            instructions: 'Clasificación de información, síntesis de mensajes y preparación de contexto.',
          },
          {
            userId: user.id,
            code: AgentCode.MANAGER,
            name: 'Manager',
            description: 'Supervisa ejecuciones, coordina flujos de agentes y genera reportes matutinos.',
            avatar: 'char_3',
            status: 'IDLE',
            instructions: 'Orquestación de flujos de trabajo en n8n, control de calidad y mitigación de fallos.',
          },
        ],
      });

      // Create initial n8n test integration credentials
      await tx.integrationCredential.create({
        data: {
          userId: user.id,
          serviceName: 'n8n',
          keyName: 'default_orchestrator',
          credentialKey: env.N8N_API_KEY,
          encryptedSecret: 'n8n_token_secured',
          metadata: {
            baseUrl: env.N8N_BASE_URL,
            workflowsUrl: env.N8N_WORKFLOWS_URL,
            webhookUrl: env.N8N_WEBHOOK_URL,
          },
          isActive: true,
        },
      });

      // Create initial Meta AI integration credential
      await tx.integrationCredential.create({
        data: {
          userId: user.id,
          serviceName: 'meta_ai',
          keyName: 'default_llm',
          credentialKey: env.META_AI_API_KEY,
          encryptedSecret: 'meta_ai_token_secured',
          metadata: {
            provider: 'Meta AI',
            model: 'LLM_Meta',
          },
          isActive: true,
        },
      });

      return user;
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error('[Register Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno al registrar el usuario: ' + error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos.',
      });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        offices: {
          take: 1,
        },
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Por favor verifica tus datos.',
      });
      return;
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Por favor verifica tus datos.',
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('[Login Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno durante el inicio de sesión: ' + error.message,
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'No autenticado' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        offices: {
          take: 1,
          include: {
            objects: true,
          },
        },
        agents: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error('[GetCurrentUser Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del usuario: ' + error.message,
    });
  }
};
