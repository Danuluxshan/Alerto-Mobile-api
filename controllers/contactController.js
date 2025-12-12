// controllers/contactController.js
import Contact from '../models/Contact.js';

// Get contact information
export const getContact = async (req, res) => {
  try {
    // Get the first contact document (there should only be one)
    const contact = await Contact.findOne().sort({ createdAt: -1 });

    if (!contact) {
      // Return empty structure if not found
      return res.status(200).json({
        success: true,
        data: {
          phone: '',
          email: '',
          website: ''
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        phone: contact.phone || '',
        email: contact.email || '',
        website: contact.website || ''
      }
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch contact information',
      message: error.message
    });
  }
};

// Create or update contact information
export const createOrUpdateContact = async (req, res) => {
  try {
    const { phone, email, website } = req.body;

    if (!phone || !email || !website) {
      return res.status(400).json({
        success: false,
        error: 'Phone, email, and website are required'
      });
    }

    // Use upsert to create or update (there should only be one contact record)
    const contact = await Contact.findOneAndUpdate(
      {},
      {
        phone,
        email,
        website
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Contact information saved successfully',
      data: {
        phone: contact.phone,
        email: contact.email,
        website: contact.website
      }
    });
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save contact information',
      message: error.message
    });
  }
};

