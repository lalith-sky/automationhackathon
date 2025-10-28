const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, TXT, DOC, and DOCX files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
    },
    fileFilter: fileFilter
});

// Upload document
router.post('/upload', auth, upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { module, tags } = req.body;
        
        const document = new Document({
            filename: req.file.filename,
            originalName: req.file.originalname,
            filePath: req.file.path,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            module: module || 'Finance',
            uploadedBy: req.user._id,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await document.save();

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: {
                id: document._id,
                filename: document.originalName,
                module: document.module,
                size: document.fileSize,
                uploadedAt: document.createdAt
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        
        // Clean up uploaded file if database save fails
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ error: 'Server error during upload' });
    }
});

// Get all documents for user
router.get('/', auth, async (req, res) => {
    try {
        const { module, status, page = 1, limit = 10 } = req.query;
        
        const filter = { uploadedBy: req.user._id };
        if (module) filter.module = module;
        if (status) filter.status = status;

        const documents = await Document.find(filter)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-content');

        const total = await Document.countDocuments(filter);

        res.json({
            documents,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            uploadedBy: req.user._id
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({ document });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update document
router.put('/:id', auth, async (req, res) => {
    try {
        const { module, tags, isPublic } = req.body;
        
        const updateData = {};
        if (module) updateData.module = module;
        if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());
        if (isPublic !== undefined) updateData.isPublic = isPublic;

        const document = await Document.findOneAndUpdate(
            { _id: req.params.id, uploadedBy: req.user._id },
            { $set: updateData },
            { new: true }
        );

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({
            message: 'Document updated successfully',
            document
        });
    } catch (error) {
        console.error('Update document error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            uploadedBy: req.user._id
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await Document.findByIdAndDelete(req.params.id);

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get document content
router.get('/:id/content', auth, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.id,
            uploadedBy: req.user._id
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json({
            content: document.content,
            extractedData: document.extractedData,
            analysis: document.analysis
        });
    } catch (error) {
        console.error('Get document content error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
