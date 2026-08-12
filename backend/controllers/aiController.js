const { getSafetyAdvice } = require('../services/aiService');

// @desc    Get AI Safety Guidance
// @route   POST /api/v1/ai/safety-advice
// @access  Private
const askSafetyAdvice = async (req, res, next) => {
  try {
    const { prompt, category } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt query is required' });
    }

    const result = await getSafetyAdvice(prompt, category);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { askSafetyAdvice };
