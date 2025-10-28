const express = require('express');
const natural = require('natural');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize natural language processing
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Analyze document content
router.post('/analyze/:documentId', auth, async (req, res) => {
    try {
        const document = await Document.findOne({
            _id: req.params.documentId,
            uploadedBy: req.user._id
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const { content } = document;
        if (!content) {
            return res.status(400).json({ error: 'Document content not available' });
        }

        // Extract names (simple pattern matching)
        const namePattern = /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g;
        const names = content.match(namePattern) || [];

        // Extract dates
        const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b\d{4}-\d{2}-\d{2}\b/g;
        const dates = content.match(datePattern) || [];

        // Extract amounts
        const amountPattern = /\$[\d,]+\.?\d*/g;
        const amounts = content.match(amountPattern) || [];

        // Extract departments (common department names)
        const departmentKeywords = ['Finance', 'HR', 'Operations', 'Marketing', 'Sales', 'IT', 'Legal', 'Compliance'];
        const departments = departmentKeywords.filter(dept => 
            content.toLowerCase().includes(dept.toLowerCase())
        );

        // Generate summary
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const summary = sentences.slice(0, 3).join('. ') + '.';

        // Extract key points
        const words = tokenizer.tokenize(content.toLowerCase());
        const wordFreq = {};
        words.forEach(word => {
            if (word.length > 3) {
                const stem = stemmer.stem(word);
                wordFreq[stem] = (wordFreq[stem] || 0) + 1;
            }
        });

        const keyWords = Object.entries(wordFreq)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word]) => word);

        // Determine risk level
        const riskKeywords = ['risk', 'issue', 'problem', 'concern', 'violation', 'non-compliance'];
        const riskCount = riskKeywords.reduce((count, keyword) => 
            count + (content.toLowerCase().split(keyword).length - 1), 0
        );
        
        const riskLevel = riskCount > 3 ? 'HIGH' : riskCount > 1 ? 'MEDIUM' : 'LOW';

        // Determine compliance status
        const complianceKeywords = ['compliant', 'approved', 'certified', 'validated'];
        const complianceCount = complianceKeywords.reduce((count, keyword) => 
            count + (content.toLowerCase().split(keyword).length - 1), 0
        );
        
        const compliance = complianceCount > 0 ? 'PASSED' : 'REVIEW_REQUIRED';

        // Calculate confidence score
        const confidence = Math.min(95, Math.max(60, 
            70 + (names.length * 2) + (dates.length * 1) + (amounts.length * 1)
        ));

        // Update document with analysis
        document.extractedData = {
            names: [...new Set(names)],
            dates: [...new Set(dates)],
            amounts: [...new Set(amounts)],
            departments: [...new Set(departments)],
            keywords: keyWords
        };

        document.analysis = {
            summary,
            keyPoints: sentences.slice(0, 5),
            riskLevel,
            compliance,
            confidence
        };

        document.status = 'analyzed';
        await document.save();

        res.json({
            message: 'Document analysis completed',
            analysis: document.analysis,
            extractedData: document.extractedData
        });
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: 'Server error during analysis' });
    }
});

// Chat with AI
router.post('/chat', auth, async (req, res) => {
    try {
        const { message, documentId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        let context = '';
        if (documentId) {
            const document = await Document.findOne({
                _id: documentId,
                uploadedBy: req.user._id
            });
            
            if (document) {
                context = document.content.substring(0, 1000); // First 1000 chars for context
            }
        }

        // Simple AI response generation
        const response = generateAIResponse(message, context);

        res.json({
            message: response,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: 'Server error during chat' });
    }
});

// Generate insights
router.post('/insights', auth, async (req, res) => {
    try {
        const { module } = req.body;
        
        const filter = { uploadedBy: req.user._id, status: 'analyzed' };
        if (module) filter.module = module;

        const documents = await Document.find(filter);
        
        const insights = generateInsights(documents, module);

        res.json({
            insights,
            documentCount: documents.length,
            module: module || 'All'
        });
    } catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({ error: 'Server error generating insights' });
    }
});

// Helper function to generate AI responses
function generateAIResponse(message, context = '') {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return "Hello! I'm J.A.R.V.I.S, your AI assistant. How can I help you analyze your documents today?";
    }
    
    if (lowerMessage.includes('summary') || lowerMessage.includes('summarize')) {
        if (context) {
            return "Based on the document content, here's a summary of the key points and findings.";
        }
        return "I can help you summarize documents. Please upload a document first, then ask me to summarize it.";
    }
    
    if (lowerMessage.includes('audit') || lowerMessage.includes('compliance')) {
        return "I can help with compliance auditing. I'll analyze documents for regulatory requirements, risk factors, and compliance issues.";
    }
    
    if (lowerMessage.includes('finance') || lowerMessage.includes('financial')) {
        return "I can analyze financial documents, extract key metrics, identify trends, and provide financial insights.";
    }
    
    if (lowerMessage.includes('hr') || lowerMessage.includes('human resources')) {
        return "I can help with HR document analysis, including employee contracts, performance reviews, and policy compliance.";
    }
    
    return "I'm here to help with document analysis. You can ask me to summarize, audit, or extract information from your documents.";
}

// Helper function to generate insights
function generateInsights(documents, module) {
    const insights = [];
    
    if (documents.length === 0) {
        return ["No documents available for analysis. Upload some documents to get insights."];
    }
    
    // Risk analysis
    const highRiskDocs = documents.filter(doc => doc.analysis?.riskLevel === 'HIGH');
    if (highRiskDocs.length > 0) {
        insights.push(`⚠️ ${highRiskDocs.length} document(s) flagged as HIGH risk requiring immediate attention.`);
    }
    
    // Compliance status
    const nonCompliantDocs = documents.filter(doc => doc.analysis?.compliance === 'FAILED');
    if (nonCompliantDocs.length > 0) {
        insights.push(`🚨 ${nonCompliantDocs.length} document(s) failed compliance checks.`);
    }
    
    // Module-specific insights
    if (module === 'Finance') {
        const totalAmounts = documents.reduce((sum, doc) => {
            const amounts = doc.extractedData?.amounts || [];
            return sum + amounts.length;
        }, 0);
        insights.push(`💰 Found ${totalAmounts} financial amounts across documents.`);
    }
    
    if (module === 'HR') {
        const totalNames = documents.reduce((sum, doc) => {
            const names = doc.extractedData?.names || [];
            return sum + names.length;
        }, 0);
        insights.push(`👥 Identified ${totalNames} unique names across HR documents.`);
    }
    
    // General insights
    const avgConfidence = documents.reduce((sum, doc) => sum + (doc.analysis?.confidence || 0), 0) / documents.length;
    insights.push(`📊 Average analysis confidence: ${Math.round(avgConfidence)}%`);
    
    return insights;
}

module.exports = router;
