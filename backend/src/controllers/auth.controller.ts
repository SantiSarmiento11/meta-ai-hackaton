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
        error: 'All fields (email, password, name) are required.',
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
        error: 'A user with this email address already exists.',
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
          name: 'Sleeply Central Office',
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
            description: 'Executes assigned technical tasks and advances project deliverables.',
            avatar: 'char_1',
            status: 'IDLE',
            instructions: 'Specialist in code, automation, and technical delivery.',
          },
          {
            userId: user.id,
            code: AgentCode.ASSISTANT,
            name: 'Executive Assistant',
            description: 'Organizes emails, documents, key information, and operational schedule.',
            avatar: 'char_2',
            status: 'IDLE',
            instructions: 'Information classification, message summarization, and context preparation.',
          },
          {
            userId: user.id,
            code: AgentCode.MANAGER,
            name: 'Operations Manager',
            description: 'Supervises system executions, coordinates agent workflows, and generates morning reports.',
            avatar: 'char_3',
            status: 'IDLE',
            instructions: 'n8n workflow orchestration, quality assurance, and failure mitigation.',
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
      message: 'User registered successfully',
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
      error: 'Internal error registering user: ' + error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required.',
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
        error: 'Invalid credentials. Please verify your details.',
      });
      return;
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your details.',
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
      message: 'Login successful',
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
      error: 'Internal error during login: ' + error.message,
    });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
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
      res.status(404).json({ success: false, error: 'User not found' });
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
      error: 'Error retrieving user data: ' + error.message,
    });
  }
};
