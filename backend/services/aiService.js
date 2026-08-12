const getSafetyAdvice = async (userPrompt, situationCategory = 'GENERAL') => {
  const promptLower = (userPrompt || '').toLowerCase().trim();

  // Mandatory Guardrail Disclaimer Text
  const SYSTEM_DISCLAIMER = "Notice: SafeSphere AI is an informational guide. It is not an emergency dispatch agency and does not provide medical diagnoses. In active danger, trigger SOS or dial official emergency services (112/100/102/101).";

  // 1. OpenAI GPT Integration (if OPENAI_API_KEY is configured)
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are SafeSphere AI Assistant, a calm, authoritative, and helpful personal safety assistant embedded in the SafeSphere web app.

STRICT GUARDRAILS & POLICIES:
1. You MUST NEVER claim to be an emergency response service or dispatch agency.
2. You MUST NEVER diagnose medical conditions or replace a doctor or medical professional.
3. You MUST NEVER fabricate emergency contact details or falsely claim that emergency authorities have been contacted.
4. For active emergency situations, ALWAYS prioritize and recommend:
   - 1. Using the SafeSphere Emergency SOS feature
   - 2. Contacting saved trusted emergency contacts
   - 3. Calling official local emergency services (112 / 100 Police / 102 Ambulance / 101 Fire)
   - 4. Accessing nearby assistance stations (police stations, ER hospitals)
5. Provide clear, concise, step-by-step actionable advice.`
          },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 450
      });

      return {
        advice: response.choices[0].message.content,
        provider: 'OpenAI GPT Assistant',
        disclaimer: SYSTEM_DISCLAIMER
      };
    } catch (err) {
      console.warn('[OpenAI Service Unavailable - Falling back to SafeSphere Knowledge Base]', err.message);
    }
  }

  // 2. Intelligent SafeSphere Safety Knowledge Engine (Graceful Fallback)

  // Q: What should I do during an emergency?
  if (promptLower.includes('during an emergency') || promptLower.includes('what should i do in an emergency') || promptLower.includes('emergency situation')) {
    return {
      advice: `🚨 **Emergency Protocol (Follow immediately):**\n\n` +
        `1. **Trigger SafeSphere Emergency SOS:** Tap the red SOS button on the dashboard to immediately alert your saved emergency contacts with your live GPS location.\n` +
        `2. **Contact Official Emergency Hotlines:**\n` +
        `   • **112** - Universal Emergency Line\n` +
        `   • **100** - Police Dispatch\n` +
        `   • **102** - Ambulance & Medical ER\n` +
        `   • **101** - Fire & Rescue\n` +
        `3. **Alert Nearby Services:** Use the Nearby Assistance feature to locate the closest open police station or hospital.\n` +
        `4. **Stay Calm & Move to Safety:** Move towards well-lit, populated areas if possible.`,
      provider: 'SafeSphere Safety Engine',
      actionLink: '/',
      actionLabel: 'Go to SOS Hub',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // Q: How do I send an SOS?
  if (promptLower.includes('send an sos') || promptLower.includes('trigger sos') || promptLower.includes('how to sos') || promptLower.includes('sos button')) {
    return {
      advice: `🆘 **How to Send an Emergency SOS Alert:**\n\n` +
        `1. Click on the **Home** or **Dashboard** tab in the main navigation menu.\n` +
        `2. Locate the large red **EMERGENCY SOS** button.\n` +
        `3. Select the emergency category (*Panic, Medical, Fire, or Crime*).\n` +
        `4. Click **DISPATCH SOS NOW**.\n` +
        `5. SafeSphere will instantly record your exact latitude and longitude, notify your primary contacts via SMS/Alert, and broadcast an active emergency distress signal.`,
      provider: 'SafeSphere Safety Engine',
      actionLink: '/',
      actionLabel: 'Open SOS Dispatcher',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // Q: How do I add a trusted contact?
  if (promptLower.includes('trusted contact') || promptLower.includes('add a contact') || promptLower.includes('emergency contact')) {
    return {
      advice: `👥 **How to Manage Trusted Emergency Contacts:**\n\n` +
        `1. Navigate to the **Emergency Contacts** page from the sidebar menu.\n` +
        `2. Click **Add Trusted Contact**.\n` +
        `3. Enter your contact's Full Name, Relationship (e.g., Parent, Spouse, Friend), and Phone Number.\n` +
        `4. Toggle **Set as Primary Contact** for your main emergency responder.\n` +
        `5. Saved contacts automatically receive instant SMS alerts and live GPS tracking links whenever you trigger an SOS.`,
      provider: 'SafeSphere Safety Engine',
      actionLink: '/contacts',
      actionLabel: 'Manage Emergency Contacts',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // Q: Where can I find nearby assistance?
  if (promptLower.includes('nearby assistance') || promptLower.includes('find nearby') || promptLower.includes('police station') || promptLower.includes('hospital')) {
    return {
      advice: `📍 **Finding Nearby Emergency Services:**\n\n` +
        `1. Go to the **Nearby Services & Safety Resources** page or open the **Interactive Safety Map**.\n` +
        `2. Grant location permissions when prompted by your browser.\n` +
        `3. You will see verified real-world stations categorized by:\n` +
        `   • **Police Stations**\n` +
        `   • **Hospitals & Emergency Rooms**\n` +
        `   • **Pharmacies**\n` +
        `   • **Fire Stations**\n` +
        `4. Click **Directions** to generate real-time turn-by-turn routing via OpenStreetMap.`,
      provider: 'SafeSphere Safety Engine',
      actionLink: '/resources',
      actionLabel: 'View Nearby Services',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // Q: What is Safe Journey?
  if (promptLower.includes('safe journey') || promptLower.includes('journey mode') || promptLower.includes('trip tracking')) {
    return {
      advice: `🧭 **SafeSphere Safe Journey Mode:**\n\n` +
        `Safe Journey is an automated trip watchdog designed for night travel, cab rides, or walking alone.\n\n` +
        `**How it works:**\n` +
        `1. Select your trusted guardian contact and enter your destination.\n` +
        `2. Set an estimated travel duration (e.g., 30 minutes).\n` +
        `3. SafeSphere actively monitors your trip progression in the foreground.\n` +
        `4. If your expected trip time expires, the app presents a 60-second safety check-in prompt.\n` +
        `5. If you fail to check in, SafeSphere triggers an automated emergency escalation workflow to notify your guardian.`,
      provider: 'SafeSphere Safety Engine',
      actionLink: '/journey',
      actionLabel: 'Configure Safe Journey',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // Q: What first-aid resources are available?
  if (promptLower.includes('first-aid') || promptLower.includes('first aid') || promptLower.includes('cpr') || promptLower.includes('health resource')) {
    return {
      advice: `📚 **First Aid & Health Resource Center:**\n\n` +
        `SafeSphere provides step-by-step verified instructional guides and video tutorials for emergency medical response:\n\n` +
        `• **CPR & Cardiac Arrest Response**\n` +
        `• **Severe Bleeding Control & Bandaging**\n` +
        `• **Choking Relief (Heimlich Maneuver)**\n` +
        `• **Burns & Scalds Treatment**\n` +
        `• **Heatstroke & Dehydration Response**\n\n` +
        `*Disclaimer: Guides are strictly for educational reference and do not replace professional medical training.*`,
      provider: 'SafeSphere Safety Engine',
      actionLink: '/resources',
      actionLabel: 'Open First Aid Resource Center',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // Followed / Stalked / Danger
  if (promptLower.includes('followed') || promptLower.includes('stalk') || promptLower.includes('behind me') || promptLower.includes('suspicious person')) {
    return {
      advice: `🚨 **If you suspect you are being followed:**\n\n` +
        `1. **Do not head home.** Walk towards a well-lit, crowded public area (store, cafe, police station).\n` +
        `2. **Change direction.** Cross the street to confirm if the person changes course to match you.\n` +
        `3. **Stay alert:** Keep your eyes up, avoid looking at your phone, and note physical descriptions.\n` +
        `4. **Activate Emergency SOS** on SafeSphere to broadcast your coordinates to trusted contacts.\n` +
        `5. **Call Police (100 / 112)** immediately if you feel threatened.`,
      provider: 'SafeSphere Safety Engine',
      actionLink: '/',
      actionLabel: 'Trigger Emergency SOS',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // Medical emergency / Bleeding / Unconscious
  if (promptLower.includes('medical') || promptLower.includes('faint') || promptLower.includes('injury') || promptLower.includes('bleed')) {
    return {
      advice: `🏥 **Immediate Medical First Aid Steps:**\n\n` +
        `1. **Call Emergency Medical Services (102 / 112)** right away.\n` +
        `2. **Severe Bleeding:** Apply firm, direct pressure with a clean cloth.\n` +
        `3. **Unconscious Person:** Check for breathing. Place in recovery position (on their side).\n` +
        `4. **Do not move injured limbs** unless in immediate danger.\n` +
        `5. **SafeSphere Medical Profile:** Show emergency responders your pre-existing conditions and blood group from your profile page.`,
        provider: 'SafeSphere Safety Engine',
      actionLink: '/profile',
      actionLabel: 'View Medical Profile',
      disclaimer: SYSTEM_DISCLAIMER
    };
  }

  // General Safety Advice Default
  return {
    advice: `🛡️ **SafeSphere General Safety Guidance:**\n\n` +
      `• **Situational Awareness:** Stay attentive to your surroundings, especially in unfamiliar or poorly lit areas.\n` +
      `• **Emergency Contacts:** Ensure you have saved at least one primary trusted contact.\n` +
      `• **Safe Journey Mode:** Enable journey tracking whenever traveling alone at night.\n` +
      `• **Instant SOS:** Tap the red SOS button on your home dashboard in any immediate threat situation.`,
    provider: 'SafeSphere Safety Engine',
    actionLink: '/',
    actionLabel: 'Return to Dashboard',
    disclaimer: SYSTEM_DISCLAIMER
  };
};

module.exports = { getSafetyAdvice };
