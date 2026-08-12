const SafetyGuide = require('../models/SafetyGuide');

// Pre-populate high quality demo guides for Safety & Health categories if empty
const seedDefaultGuides = async () => {
  const count = await SafetyGuide.countDocuments();
  if (count === 0) {
    await SafetyGuide.create([
      // --- HEALTH CATEGORIES ---
      {
        title: 'Step-by-Step Hands-Only CPR Emergency Response',
        description: 'Critical life-saving CPR technique for cardiac arrest emergencies before medical responders arrive.',
        type: 'VIDEO',
        categoryGroup: 'HEALTH',
        category: 'CPR',
        readTime: '3 min watch',
        videoUrl: 'https://www.youtube.com/embed/M4ACYp75mjU',
        videoDuration: '2:45',
        thumbnailUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
        content: `### Hands-Only CPR Instructions
1. **Call 112 / Emergency Medical Services** immediately or ask a bystander to call.
2. **Check for Responsiveness**: Tap the person's shoulder firmly and shout, "Are you okay?"
3. **Position Hands**: Place the heel of one hand in the center of the chest. Place your other hand on top and interlock fingers.
4. **Push Hard and Fast**: Compress chest at least 2 inches deep at a rate of 100 to 120 beats per minute (to the rhythm of the song "Stayin' Alive").
5. **Continue Compressions**: Keep giving chest compressions until emergency medical personnel take over.`
      },
      {
        title: 'First Aid Treatment for Severe Burns and Scalds',
        description: 'Immediate action plan for treating first, second, and third-degree thermal and chemical burns.',
        type: 'ARTICLE',
        categoryGroup: 'HEALTH',
        category: 'First aid',
        readTime: '4 min read',
        thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
        content: `### Burn First Aid Treatment
- **Cool Immediately**: Hold burn under cool (not ice-cold) running water for at least 10 to 15 minutes.
- **Protect the Burn**: Cover loosely with sterile gauze or clean non-stick bandage.
- **Do Not Break Blisters**: Intact blisters protect against bacterial skin infections.
- **Avoid Home Remedies**: Never apply butter, oil, ice, or toothpaste to burn wounds.
- **Seek Emergency Care**: If burn is larger than 3 inches, located on face, hands, or groin, call 112 immediately.`
      },
      {
        title: 'Mental Health De-escalation & Grounding Techniques',
        description: '5-4-3-2-1 Sensory Grounding exercise to manage panic attacks and acute anxiety episodes.',
        type: 'ARTICLE',
        categoryGroup: 'HEALTH',
        category: 'Mental wellbeing',
        readTime: '5 min read',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop&q=80',
        content: `### 5-4-3-2-1 Grounding Method
- **5 Things You Can See**: Look around and acknowledge 5 objects in your immediate surroundings.
- **4 Things You Can Touch**: Feel 4 textures around you (your clothes, chair, desk, ground).
- **3 Things You Can Hear**: Listen for 3 distinct ambient sounds (clock ticking, traffic, wind).
- **2 Things You Can Smell**: Identify 2 scents near you (coffee, rain, soap).
- **1 Thing You Can Taste**: Focus on 1 taste in your mouth (mint, water).`
      },
      {
        title: 'Basic Emergency Response for Accidental Poisoning',
        description: 'First response protocol for household chemical ingestion, hazardous fumes, or drug overdoses.',
        type: 'ARTICLE',
        categoryGroup: 'HEALTH',
        category: 'Basic emergency response',
        readTime: '4 min read',
        thumbnailUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
        content: `### Immediate Poisoning Steps
1. **Identify the Substance**: Locate container or label safely without exposing yourself.
2. **Do Not Induce Vomiting**: Unless explicitly instructed by Poison Control or emergency medical officers.
3. **Inhaled Poisons**: Move victim immediately to fresh air.
4. **Call Poison Emergency Helpline**: Contact emergency services (112 / Poison Control) immediately.`
      },

      // --- SAFETY CATEGORIES ---
      {
        title: 'Personal Urban Safety & Situational Awareness Guide',
        description: 'Practical strategies to stay alert, avoid dangerous encounters, and travel securely at night.',
        type: 'ARTICLE',
        categoryGroup: 'SAFETY',
        category: 'Personal safety',
        readTime: '6 min read',
        thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        content: `### Essential Personal Safety Rules
- **Stay Aware**: Avoid looking down at mobile screens or wearing noise-canceling headphones when walking alone.
- **Trust Your Instincts**: If a situation or individual feels unsafe, walk toward well-lit public areas immediately.
- **Keep Phone Accessible**: Ensure phone battery is charged and SafeSphere Emergency SOS shortcut is ready.
- **Share Live Journey**: Activate Safe Journey mode when taking cabs or walking late at night.`
      },
      {
        title: 'Home Fire Evacuation & Prevention Masterplan',
        description: 'How to create a family fire escape plan, test smoke alarms, and operate fire extinguishers.',
        type: 'VIDEO',
        categoryGroup: 'SAFETY',
        category: 'Fire safety',
        readTime: '4 min watch',
        videoUrl: 'https://www.youtube.com/embed/bVR3cdDP43g',
        videoDuration: '3:15',
        thumbnailUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        content: `### The PASS Fire Extinguisher Technique
- **P - Pull**: Pull the safety pin at the top of the extinguisher.
- **A - Aim**: Aim the nozzle at the base of the fire, not the flames.
- **S - Squeeze**: Squeeze the lever slowly and evenly.
- **S - Sweep**: Sweep the nozzle from side to side at the base of the fire.`
      },
      {
        title: '72-Hour Emergency Survival Kit Checklist',
        description: 'Complete inventory list for packing a disaster preparedness bug-out bag for natural disasters.',
        type: 'ARTICLE',
        categoryGroup: 'SAFETY',
        category: 'Disaster preparedness',
        readTime: '5 min read',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80',
        content: `### 72-Hour Disaster Kit Items
- **Water**: 1 gallon per person per day for drinking and sanitation.
- **Non-Perishable Food**: 3-day supply of canned protein, energy bars, and manual can opener.
- **First Aid Kit**: Bandages, antiseptic wipes, burn cream, prescription medications.
- **Flashlight & Radio**: Hand-crank or battery-powered emergency radio.
- **Emergency Blanket & Whistle**: For signalling for rescue.`
      },
      {
        title: 'Highway Road Safety & Vehicle Breakdown Protocol',
        description: 'What to do if your car breaks down on a highway or secluded road to stay safe from traffic.',
        type: 'ARTICLE',
        categoryGroup: 'SAFETY',
        category: 'Road safety',
        readTime: '4 min read',
        thumbnailUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&auto=format&fit=crop&q=80',
        content: `### Vehicle Breakdown Safety
- **Pull Over Safely**: Turn on hazard lights immediately and move to shoulder or emergency lane.
- **Stay Inside Vehicle**: Keep seatbelt fastened if stopping near heavy highway traffic.
- **Deploy Warning Triangle**: Place hazard warning triangle 50 meters behind vehicle if safe to exit.
- **Call Highway Patrol**: Use SafeSphere to locate nearest police or roadside assistance.`
      }
    ]);
  }
};

seedDefaultGuides().catch(e => console.warn('[Guide Seed Error]', e.message));

// @desc    Get all safety & health guides with filters & bookmark status
// @route   GET /api/v1/resources/guides or /api/resources/guides
// @access  Public
const getGuides = async (req, res, next) => {
  try {
    const { categoryGroup, category, type, search, bookmarkedOnly } = req.query;
    let query = {};

    if (categoryGroup && categoryGroup !== 'ALL') {
      query.categoryGroup = categoryGroup.toUpperCase();
    }

    if (category && category !== 'ALL') {
      query.category = category;
    }

    if (type && type !== 'ALL') {
      query.type = type.toUpperCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (bookmarkedOnly === 'true' && req.user) {
      query.bookmarkedBy = req.user._id;
    }

    const guides = await SafetyGuide.find(query).sort({ createdAt: -1 });

    const processed = guides.map((g) => {
      const isBookmarked = req.user ? g.bookmarkedBy.includes(req.user._id) : false;
      return {
        _id: g._id,
        title: g.title,
        description: g.description,
        content: g.content,
        type: g.type,
        categoryGroup: g.categoryGroup,
        category: g.category,
        readTime: g.readTime,
        videoUrl: g.videoUrl,
        videoDuration: g.videoDuration,
        thumbnailUrl: g.thumbnailUrl,
        author: g.author,
        isBookmarked,
        createdAt: g.createdAt
      };
    });

    return res.json({
      success: true,
      count: processed.length,
      data: processed
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single guide by ID
// @route   GET /api/v1/resources/guides/:id
// @access  Public
const getGuideById = async (req, res, next) => {
  try {
    const guide = await SafetyGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    const isBookmarked = req.user ? guide.bookmarkedBy.includes(req.user._id) : false;

    return res.json({
      success: true,
      data: {
        ...guide.toObject(),
        isBookmarked
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle bookmark status for logged in user
// @route   POST /api/v1/resources/guides/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const guide = await SafetyGuide.findById(req.params.id);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Guide not found' });
    }

    const userIdStr = req.user._id.toString();
    const index = guide.bookmarkedBy.findIndex(id => id.toString() === userIdStr);

    let isBookmarked = false;
    if (index > -1) {
      guide.bookmarkedBy.splice(index, 1);
      isBookmarked = false;
    } else {
      guide.bookmarkedBy.push(req.user._id);
      isBookmarked = true;
    }

    await guide.save();

    return res.json({
      success: true,
      message: isBookmarked ? 'Resource bookmarked' : 'Resource bookmark removed',
      isBookmarked
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGuides,
  getGuideById,
  toggleBookmark
};
