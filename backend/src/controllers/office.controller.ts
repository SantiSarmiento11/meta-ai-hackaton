import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../types';
import { OperatingMode } from '@prisma/client';

export const getOffice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    let office = await prisma.office.findFirst({
      where: { userId },
      include: {
        objects: true,
      },
    });

    // If no office exists yet for this user, create one automatically
    if (!office) {
      office = await prisma.office.create({
        data: {
          userId,
          name: 'Sleeply Central Office',
          currentMode: OperatingMode.DAY,
          selectedAvatarId: 'char_0',
          zoomLevel: 1.0,
          isGridVisible: false,
        },
        include: {
          objects: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      office,
    });
  } catch (error: any) {
    console.error('[GetOffice Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error retrieving office: ' + error.message,
    });
  }
};

export const saveOffice = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    const {
      name,
      currentMode,
      selectedAvatarId,
      zoomLevel,
      isGridVisible,
      objects,
    } = req.body;

    // Retrieve or create office for user
    let office = await prisma.office.findFirst({
      where: { userId },
    });

    if (!office) {
      office = await prisma.office.create({
        data: {
          userId,
          name: name || 'Sleeply Central Office',
          currentMode: currentMode === 'night' ? OperatingMode.NIGHT : OperatingMode.DAY,
          selectedAvatarId: selectedAvatarId || 'char_0',
          zoomLevel: typeof zoomLevel === 'number' ? zoomLevel : 1.0,
          isGridVisible: !!isGridVisible,
        },
      });
    }

    const officeId = office.id;

    // Use a transaction to update office metadata and synchronize objects atomically
    const updatedOffice = await prisma.$transaction(async (tx) => {
      // 1. Update office properties
      const updated = await tx.office.update({
        where: { id: officeId },
        data: {
          ...(name && { name }),
          ...(currentMode && {
            currentMode: currentMode.toUpperCase() === 'NIGHT' ? OperatingMode.NIGHT : OperatingMode.DAY,
          }),
          ...(selectedAvatarId && { selectedAvatarId }),
          ...(typeof zoomLevel === 'number' && { zoomLevel }),
          ...(typeof isGridVisible === 'boolean' && { isGridVisible }),
        },
      });

      // 2. If objects array is provided, sync placed objects
      if (Array.isArray(objects)) {
        // Delete objects belonging to this office
        await tx.officeObject.deleteMany({
          where: { officeId },
        });

        // Insert fresh collection
        if (objects.length > 0) {
          const objectsToInsert = objects.map((obj: any) => ({
            officeId,
            objectId: obj.objectId,
            instanceId: obj.instanceId || `${obj.objectId}_${obj.col}_${obj.row}_${Date.now()}`,
            col: parseInt(obj.col, 10),
            row: parseInt(obj.row, 10),
            width: parseInt(obj.width || obj.footprint?.width || 1, 10),
            height: parseInt(obj.height || obj.footprint?.height || 1, 10),
          }));

          await tx.officeObject.createMany({
            data: objectsToInsert,
          });
        }
      }

      return tx.office.findUnique({
        where: { id: officeId },
        include: {
          objects: true,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: 'Office and furniture saved successfully',
      office: updatedOffice,
    });
  } catch (error: any) {
    console.error('[SaveOffice Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Error saving office: ' + error.message,
    });
  }
};
