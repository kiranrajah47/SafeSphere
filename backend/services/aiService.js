const getSafetyAdvice = async (userPrompt, situationCategory = 'GENERAL') => {
  // If OpenAI API Key is provided, use OpenAI completion
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are SafeSphere AI, a calm, authoritative, and helpful personal safety assistant. Provide concise, step-by-step actionable advice for emergency, self-defense, travel safety, or disaster situations.'
          },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 350
      });
      return {
        advice: response.choices[0].message.content,
        provider: 'OpenAI GPT'
      };
    } catch (err) {
      console.warn('[OpenAI Fallback Triggered]', err.message);
    }
  }

  // Intelligent Built-in Safety Knowledge Engine Fallback
  const promptLower = userPrompt.toLowerCase();
  
  if (promptLower.includes('followed') || promptLower.includes('stalk') || promptLower.includes('behind')) {
    return {
      advice: `🚨 **If you suspect you are being followed:**\n\n` +
        `1. **Do not go home directly.** Head towards a well-lit, crowded public area (store, gas station, cafe, police station).\n` +
        `2. **Change your speed and direction.** Cross the street to confirm if the person alters their route to match yours.\n` +
        `3. **Make your awareness obvious.** Turn around calmly, look at their face (to remember details), but avoid aggressive confrontation.\n` +
        `4. **Activate SafeSphere Emergency SOS.** Tap the SOS button in this app to broadcast your live location to trusted contacts.\n` +
        `5. **Call local emergency services (e.g. 112 / 911 / 100).** Speak clearly and give your exact street intersection.`,
      provider: 'SafeSphere Safety Engine'
    };
  }

  if (promptLower.includes('medical') || promptLower.includes('faint') || promptLower.includes('injury') || promptLower.includes('bleed')) {
    return {
      advice: `🏥 **Immediate First Aid & Medical Protocol:**\n\n` +
        `1. **Call Emergency Medical Services immediately.**\n` +
        `2. **Severe Bleeding:** Apply firm, direct pressure to the wound using a clean cloth or bandage.\n` +
        `3. **Unconscious Person:** Check breathing. If breathing, place in the recovery position (on their side). If not breathing, start CPR if trained.\n` +
        `4. **Keep Patient Warm and Calm:** Avoid moving injured limbs unless in immediate danger.\n` +
        `5. **Share Medical Info:** Open your SafeSphere Medical Profile to show responders blood type and pre-existing conditions.`,
      provider: 'SafeSphere Safety Engine'
    };
  }

  if (promptLower.includes('fire') || promptLower.includes('smoke')) {
    return {
      advice: `🔥 **Fire Safety & Evacuation Protocol:**\n\n` +
        `1. **Get Out Immediately.** Do not delay to gather personal items.\n` +
        `2. **Stay Low:** Crawl under smoke to avoid toxic gas inhalation.\n` +
        `3. **Test Doors:** Before opening doors, touch with the back of your hand. If hot, use another exit.\n` +
        `4. **Call Fire Emergency (101 / 911 / 112)** once safely outside.\n` +
        `5. **Never re-enter a burning building.**`,
      provider: 'SafeSphere Safety Engine'
    };
  }

  if (promptLower.includes('cab') || promptLower.includes('ride') || promptLower.includes('travel') || promptLower.includes('night')) {
    return {
      advice: `🚕 **Night Travel & Ride Safety Checklist:**\n\n` +
        `1. **Verify Ride Details:** Match driver photo, license plate number, and vehicle model before entering.\n` +
        `2. **Enable Safe Sphere Safe Journey Mode:** Set your destination and check-in timer so trusted contacts track your arrival.\n` +
        `3. **Sit in the Back Seat:** Gives you two exit doors and creates distance from the driver.\n` +
        `4. **Share Live Trip Status:** Call a friend or family member and read out loud that you are on your way.\n` +
        `5. **Trust Your Instincts:** If the route looks wrong or driver behaves suspiciously, ask to be let out at a safe public spot.`,
      provider: 'SafeSphere Safety Engine'
    };
  }

  // General default safety protocol
  return {
    advice: `🛡️ **SafeSphere General Safety Checklist:**\n\n` +
      `• Maintain situational awareness: Keep your head up and limit phone distractions in unfamiliar areas.\n` +
      `• Keep emergency contacts updated in your SafeSphere profile.\n` +
      `• Save local helpline numbers on speed dial.\n` +
      `• In case of immediate danger, tap and hold the SOS panic button for 3 seconds.`,
    provider: 'SafeSphere Safety Engine'
  };
};

module.exports = { getSafetyAdvice };
