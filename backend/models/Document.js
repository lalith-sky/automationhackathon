const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Filename is required'],
        trim: true
    },
    originalName: {
        type: String,
        required: [true, 'Original filename is required'],
        trim: true
    },
    filePath: {
        type: String,
        required: [true, 'File path is required']
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required']
    },
    mimeType: {
        type: String,
        required: [true, 'MIME type is required']
    },
    module: {
        type: String,
        required: [true, 'Module is required'],
        enum: ['Finance', 'HR', 'Analytics', 'Compliance', 'Reports'],
        default: 'Finance'
    },
    content: {
        type: String,
        default: ''
    },
    extractedData: {
        names: [String],
        dates: [String],
        amounts: [String],
        departments: [String],
        keywords: [String]
    },
    analysis: {
        summary: String,
        keyPoints: [String],
        riskLevel: {
            type: String,
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            default: 'LOW'
        },
        compliance: {
            type: String,
            enum: ['PASSED', 'FAILED', 'REVIEW_REQUIRED'],
            default: 'REVIEW_REQUIRED'
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    status: {
        type: String,
        enum: ['uploaded', 'processing', 'analyzed', 'error'],
        default: 'uploaded'
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Uploader is required']
    },
    tags: [String],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for better query performance
documentSchema.index({ module: 1, uploadedBy: 1 });
documentSchema.index({ status: 1 });
documentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
