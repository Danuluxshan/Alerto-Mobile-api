// controllers/supportLegalController.js
import SupportLegal from '../models/SupportLegal.js';

// Get content by type
export const getContentByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!type || !['about', 'privacy_policy', 'terms_of_service'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content type. Must be: about, privacy_policy, or terms_of_service'
      });
    }

    const content = await SupportLegal.findOne({ type });

    // Transform to match frontend format
    let transformedContent;
    
    if (!content) {
      // Return empty content structure if not found (instead of 404)
      if (type === 'about') {
        transformedContent = {
          paragraphs: []
        };
      } else if (type === 'privacy_policy') {
        transformedContent = {
          introduction: '',
          sections: []
        };
      } else if (type === 'terms_of_service') {
        transformedContent = {
          introduction: '',
          terms: []
        };
      }
    } else {
      // Transform existing content
      if (type === 'about') {
        transformedContent = {
          paragraphs: content.paragraphs || []
        };
      } else if (type === 'privacy_policy') {
        transformedContent = {
          introduction: content.introduction || '',
          sections: content.sections || []
        };
      } else if (type === 'terms_of_service') {
        transformedContent = {
          introduction: content.introduction || '',
          terms: content.terms || []
        };
      }
    }

    res.status(200).json({
      success: true,
      data: transformedContent
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content',
      message: error.message
    });
  }
};

// Create or update content
export const createOrUpdateContent = async (req, res) => {
  try {
    const { type, paragraphs, introduction, sections, terms } = req.body;

    if (!type || !['about', 'privacy_policy', 'terms_of_service'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid content type. Must be: about, privacy_policy, or terms_of_service'
      });
    }

    // Validate content based on type
    if (type === 'about' && !paragraphs) {
      return res.status(400).json({
        success: false,
        error: 'Paragraphs are required for about content'
      });
    }

    if ((type === 'privacy_policy' || type === 'terms_of_service') && !introduction) {
      return res.status(400).json({
        success: false,
        error: 'Introduction is required for privacy_policy and terms_of_service content'
      });
    }

    // Use upsert to create or update
    const content = await SupportLegal.findOneAndUpdate(
      { type },
      {
        type,
        paragraphs: paragraphs || undefined,
        introduction: introduction || undefined,
        sections: sections || undefined,
        terms: terms || undefined
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    // Transform response
    let transformedContent;
    
    if (type === 'about') {
      transformedContent = {
        paragraphs: content.paragraphs || []
      };
    } else if (type === 'privacy_policy') {
      transformedContent = {
        introduction: content.introduction || '',
        sections: content.sections || []
      };
    } else if (type === 'terms_of_service') {
      transformedContent = {
        introduction: content.introduction || '',
        terms: content.terms || []
      };
    }

    res.status(200).json({
      success: true,
      message: 'Content saved successfully',
      data: transformedContent
    });
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save content',
      message: error.message
    });
  }
};