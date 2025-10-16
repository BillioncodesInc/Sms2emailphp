const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class AttachmentStorage {
  constructor() {
    this.storageDir = path.join(__dirname, '../data/attachments');
    this.metadataFile = path.join(__dirname, '../data/attachments/metadata.json');
    this.attachments = new Map();
  }

  /**
   * Initialize storage directory and load metadata
   */
  async initialize() {
    try {
      // Create storage directory if it doesn't exist
      await fs.mkdir(this.storageDir, { recursive: true });

      // Load existing metadata
      try {
        const data = await fs.readFile(this.metadataFile, 'utf-8');
        const metadata = JSON.parse(data);

        // Convert array to Map for efficient lookups
        if (Array.isArray(metadata)) {
          metadata.forEach(item => {
            this.attachments.set(item.id, item);
          });
        }

        console.log(`Loaded ${this.attachments.size} attachments from storage`);
      } catch (err) {
        // File doesn't exist yet, start with empty storage
        console.log('No existing attachments found, starting fresh');
      }
    } catch (error) {
      console.error('Failed to initialize attachment storage:', error);
      throw error;
    }
  }

  /**
   * Save metadata to disk
   */
  async saveMetadata() {
    try {
      const metadata = Array.from(this.attachments.values());
      await fs.writeFile(this.metadataFile, JSON.stringify(metadata, null, 2));
    } catch (error) {
      console.error('Failed to save attachment metadata:', error);
      throw error;
    }
  }

  /**
   * Upload and store an attachment
   * @param {Object} fileData - File data with name, content, and type
   * @returns {Object} Attachment metadata
   */
  async uploadAttachment(fileData) {
    try {
      const { name, content, type, description = '' } = fileData;

      if (!name || !content) {
        throw new Error('Name and content are required');
      }

      // Generate unique ID
      const id = crypto.randomBytes(16).toString('hex');

      // Sanitize filename
      const sanitizedName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${id}_${sanitizedName}`;
      const filepath = path.join(this.storageDir, filename);

      // Determine if content is base64 or raw
      let buffer;
      if (typeof content === 'string' && content.includes('base64,')) {
        // Extract base64 data from data URL
        const base64Data = content.split('base64,')[1];
        buffer = Buffer.from(base64Data, 'base64');
      } else if (Buffer.isBuffer(content)) {
        buffer = content;
      } else {
        // Assume it's plain text
        buffer = Buffer.from(content, 'utf-8');
      }

      // Save file to disk
      await fs.writeFile(filepath, buffer);

      // Calculate file size
      const stats = await fs.stat(filepath);

      // Create metadata
      const metadata = {
        id,
        name: sanitizedName,
        originalName: name,
        filename,
        type: type || 'application/octet-stream',
        size: stats.size,
        description,
        uploadedAt: new Date().toISOString(),
        path: filepath
      };

      // Store metadata
      this.attachments.set(id, metadata);
      await this.saveMetadata();

      return {
        success: true,
        attachment: metadata
      };
    } catch (error) {
      console.error('Failed to upload attachment:', error);
      throw error;
    }
  }

  /**
   * Get all attachments
   * @returns {Array} List of all attachments
   */
  getAllAttachments() {
    return Array.from(this.attachments.values()).map(att => ({
      id: att.id,
      name: att.name,
      originalName: att.originalName,
      type: att.type,
      size: att.size,
      description: att.description,
      uploadedAt: att.uploadedAt
    }));
  }

  /**
   * Get attachment by ID
   * @param {string} id - Attachment ID
   * @returns {Object} Attachment metadata
   */
  getAttachment(id) {
    const attachment = this.attachments.get(id);
    if (!attachment) {
      return null;
    }

    return {
      id: attachment.id,
      name: attachment.name,
      originalName: attachment.originalName,
      type: attachment.type,
      size: attachment.size,
      description: attachment.description,
      uploadedAt: attachment.uploadedAt
    };
  }

  /**
   * Get attachment file content
   * @param {string} id - Attachment ID
   * @returns {Buffer} File content
   */
  async getAttachmentContent(id) {
    const attachment = this.attachments.get(id);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    try {
      return await fs.readFile(attachment.path);
    } catch (error) {
      console.error('Failed to read attachment file:', error);
      throw error;
    }
  }

  /**
   * Delete an attachment
   * @param {string} id - Attachment ID
   * @returns {Object} Result
   */
  async deleteAttachment(id) {
    const attachment = this.attachments.get(id);
    if (!attachment) {
      return {
        success: false,
        message: 'Attachment not found'
      };
    }

    try {
      // Delete file from disk
      await fs.unlink(attachment.path);

      // Remove from metadata
      this.attachments.delete(id);
      await this.saveMetadata();

      return {
        success: true,
        message: 'Attachment deleted successfully'
      };
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      throw error;
    }
  }

  /**
   * Update attachment metadata
   * @param {string} id - Attachment ID
   * @param {Object} updates - Fields to update (name, description)
   * @returns {Object} Updated attachment
   */
  async updateAttachment(id, updates) {
    const attachment = this.attachments.get(id);
    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Only allow updating certain fields
    const allowedUpdates = ['name', 'description', 'originalName'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        attachment[field] = updates[field];
      }
    });

    attachment.updatedAt = new Date().toISOString();

    this.attachments.set(id, attachment);
    await this.saveMetadata();

    return {
      success: true,
      attachment: this.getAttachment(id)
    };
  }

  /**
   * Search attachments by name or type
   * @param {Object} filters - Search filters
   * @returns {Array} Matching attachments
   */
  searchAttachments(filters = {}) {
    const { name, type, limit = 50 } = filters;

    let results = Array.from(this.attachments.values());

    if (name) {
      const searchTerm = name.toLowerCase();
      results = results.filter(att =>
        att.name.toLowerCase().includes(searchTerm) ||
        att.originalName.toLowerCase().includes(searchTerm)
      );
    }

    if (type) {
      results = results.filter(att => att.type.includes(type));
    }

    // Sort by upload date (newest first)
    results.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

    // Apply limit
    return results.slice(0, limit).map(att => ({
      id: att.id,
      name: att.name,
      originalName: att.originalName,
      type: att.type,
      size: att.size,
      description: att.description,
      uploadedAt: att.uploadedAt
    }));
  }

  /**
   * Get storage statistics
   * @returns {Object} Storage stats
   */
  getStats() {
    const attachments = Array.from(this.attachments.values());
    const totalSize = attachments.reduce((sum, att) => sum + att.size, 0);

    return {
      totalAttachments: attachments.length,
      totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      byType: this.groupByType(attachments)
    };
  }

  /**
   * Group attachments by type
   * @param {Array} attachments - List of attachments
   * @returns {Object} Grouped by type
   */
  groupByType(attachments) {
    const grouped = {};
    attachments.forEach(att => {
      const type = att.type.split('/')[0] || 'other';
      if (!grouped[type]) {
        grouped[type] = { count: 0, size: 0 };
      }
      grouped[type].count++;
      grouped[type].size += att.size;
    });
    return grouped;
  }
}

module.exports = AttachmentStorage;
