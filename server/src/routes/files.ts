import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import type { AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.fields([
  { name: 'bankFile', maxCount: 1 },
  { name: 'providerFile', maxCount: 1 }
]), async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const bankFile = files['bankFile']?.[0];
    const providerFile = files['providerFile']?.[0];

    if (!bankFile || !providerFile) {
      return res.status(400).json({ error: 'Both bank and provider files are required' });
    }

    // Save files to database
    const bankRecord = await prisma.file.create({
      data: {
        filename: bankFile.originalname,
        type: 'bank',
        content: bankFile.buffer.toString('utf-8'),
        userId: req.user.id,
      },
    });

    const providerRecord = await prisma.file.create({
      data: {
        filename: providerFile.originalname,
        type: 'provider',
        content: providerFile.buffer.toString('utf-8'),
        userId: req.user.id,
      },
    });

    res.json({
      success: true,
      bankFileId: bankRecord.id,
      providerFileId: providerRecord.id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/save-reconciliation', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { report, bankFileId, providerFileId } = req.body;

    if (!report || !bankFileId || !providerFileId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create reconciliation record
    const reconciliation = await prisma.reconciliation.create({
      data: {
        totalBank: report.totalBank,
        totalProvider: report.totalProvider,
        matched: report.matched,
        unmatched: report.unmatched,
        discrepancies: report.discrepancies,
        matchRate: report.matchRate,
        reconcilableBank: report.reconcilableBank,
        reconcilableProvider: report.reconcilableProvider,
        results: JSON.stringify(report.results),
        userId: req.user.id,
        files: {
          connect: [
            { id: bankFileId },
            { id: providerFileId }
          ]
        }
      }
    });

    // Update files to link to reconciliation
    await prisma.file.updateMany({
      where: { id: { in: [bankFileId, providerFileId] } },
      data: { reconciliationId: reconciliation.id }
    });

    res.json({ success: true, reconciliationId: reconciliation.id });
  } catch (error) {
    console.error('Save reconciliation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reconciliations = await prisma.reconciliation.findMany({
      where: { userId: req.user.id },
      include: {
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reconciliations);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/reconciliation/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const reconciliationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reconciliation = await prisma.reconciliation.findUnique({
      where: { id: reconciliationId },
      include: {
        files: true,
      },
    });

    if (!reconciliation) {
      return res.status(404).json({ error: 'Reconciliation not found' });
    }

    if (reconciliation.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      ...reconciliation,
      results: JSON.parse(reconciliation.results),
    });
  } catch (error) {
    console.error('Get reconciliation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/download/:id', async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (file.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.content);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as fileRouter };
