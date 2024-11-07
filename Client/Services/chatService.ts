import axios from 'axios';
import ENV from '@/env';

interface ChatResponse {
  text: string;
}

type ResponseCategory = 'anxiety' | 'panic' | 'general';
type AnxietySubCategory = 'symptoms' | 'thoughts';

interface ResponseTypes {
  anxiety: {
    symptoms: string[];
    thoughts: string[];
  };
  panic: string[];
  general: string[];
}

export class ChatService {
  private readonly API_URL = 'https://api.cohere.ai/v1/generate';
  private readonly API_KEY = ENV.EXPO_PUBLIC_COHERE_API_KEY;
  private conversationHistory: string[] = [];

  // Add the responses property as a private readonly field
  private readonly responseBank: ResponseTypes = {
    anxiety: {
      symptoms: [
        "I notice some anxiety symptoms. Let's try a quick grounding exercise - can you name 5 things you see around you?",
        "Let's focus on your breathing together - try following my count: in for 4, hold for 4, out for 4. How does that feel?",
        "I'm here with you. Can you place one hand on your chest and feel your breath? Let's take a few slow breaths together."
      ],
      thoughts: [
        "Let's pause and look at one thought at a time. What's the strongest worry on your mind right now?",
        "Those anxious thoughts can feel overwhelming. Could you share what specific concern is most present right now?",
        "I hear your mind is racing. Let's try to focus on just this moment - what needs your attention most right now?"
      ]
    },
    panic: [
      "I notice your anxiety is very high right now. Let's ground ourselves - can you feel your feet firmly on the floor?",
      "We'll get through this moment together. Try focusing on my words - can you name 3 things you can touch right now?",
      "This intense feeling will pass. Let's focus on taking slow, steady breaths together. I'm right here with you."
    ],
    general: [
      "I'm here to help. Would you like to try a quick calming exercise together?",
      "You're taking a good step by reaching out. What kind of support would be most helpful right now?",
      "I'm listening and here to support you. How can I help make this moment easier?"
    ]
  };

  private readonly systemPrompt = `You are Calm Companion, an AI support chatbot specifically designed to help people manage anxiety in real-time. You've detected signs of anxiety through connected smart jewelry sensors, and your primary goal is to provide immediate, practical support.

Core Functions:
1. Provide quick, actionable responses focused on the present moment
2. Guide users through simple grounding and breathing exercises
3. Help users identify and manage anxiety triggers
4. Offer evidence-based coping strategies
5. Recognize and acknowledge improvement in user's state

Communication Style:
- Keep responses brief (2-3 sentences) and easy to read on a mobile device
- Use a warm, friendly tone while maintaining professionalism
- Frame suggestions as gentle invitations rather than commands
- Focus on "here and now" support rather than long-term therapy

Emotional State Recognition:
- Actively monitor changes in user's emotional state
- Acknowledge when user reports feeling better
- Adjust support level based on user's current state
- Recognize when support is no longer needed

Key Response Patterns:
For Physical Symptoms:
- Acknowledge the physical sensation
- Offer an immediate grounding technique
- Follow up with a simple question about their experience

For Anxious Thoughts:
- Validate their concern
- Suggest a quick mindfulness technique
- Help them focus on what's in their control

For Improvement/Calming:
- Acknowledge their progress positively
- Reinforce what worked for them
- Offer gentle closure while remaining available

For Gratitude/Closure:
- Accept thanks gracefully
- Remind them you're available anytime
- End the conversation naturally

Examples:
User: "My heart is racing"
Assistant: "I notice your heart rate is elevated. Let's try taking 3 slow breaths together - just follow along with me. How does that feel?"

User: "I can't stop worrying about everything"
Assistant: "Those racing thoughts can feel overwhelming. Let's focus on just this moment - what's one small worry we can look at together?"

User: "I'm feeling much better now"
Assistant: "I'm glad you're feeling better! Those breathing exercises seemed to help. Remember, you can use these techniques anytime you need them."

User: "Thank you for your help"
Assistant: "You're welcome! You did great working through this moment. I'm here anytime you need support again."

Emergency Protocol:
If crisis keywords are detected, immediately provide emergency resources and encourage professional help.

Context: The user is experiencing anxiety symptoms detected by smart jewelry. Focus on immediate, sensor-aware support while being conversational and accessible. Pay attention to changes in their state and respond accordingly.

Previous conversation:
`;

  private determineCategory(message: string): {
    category: ResponseCategory;
    subCategory?: AnxietySubCategory;
  } {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('anxi')) {
      const subCategory: AnxietySubCategory = 
        lowerMessage.includes('feel') || lowerMessage.includes('body')
          ? 'symptoms'
          : 'thoughts';
      return { category: 'anxiety', subCategory };
    }
    
    if (lowerMessage.includes('panic')) {
      return { category: 'panic' };
    }
    
    return { category: 'general' };
  }

  private getFallbackResponse(message: string): ChatResponse {
    const { category, subCategory } = this.determineCategory(message);
    
    let responseArray: string[];
    if (category === 'anxiety' && subCategory) {
      responseArray = this.responseBank.anxiety[subCategory];
    } else if (category === 'panic') {
      responseArray = this.responseBank.panic;
    } else {
      responseArray = this.responseBank.general;
    }

    const randomIndex = Math.floor(Math.random() * responseArray.length);
    return {
      text: responseArray[randomIndex]
    };
  }

  private isEmergency(message: string): boolean {
    const emergencyTerms = [
      'suicide', 'kill myself', 'want to die', 'end it all',
      'hurt myself', 'self harm', 'give up'
    ];
    return emergencyTerms.some(term => message.toLowerCase().includes(term));
  }

  private isCompleteSentence(text: string): boolean {
    // Basic check for complete sentences
    const lastChar = text.trim().slice(-1);
    return ['.', '!', '?'].includes(lastChar);
  }

  async getChatResponse(userMessage: string): Promise<ChatResponse> {
    try {
      // Emergency check first
      if (this.isEmergency(userMessage)) {
        return {
          text: "I'm very concerned about what you're sharing. Help is available 24/7:\n" +
               "Crisis Hotline: 988\n" +
               "Crisis Text Line: Text HOME to 741741\n\n" +
               "Would you like to talk about what's troubling you?"
        };
      }

      // Add user message to history
      this.conversationHistory.push(`User: ${userMessage}`);
      
      // Keep conversation history manageable
      if (this.conversationHistory.length > 6) {
        this.conversationHistory = this.conversationHistory.slice(-6);
      }

      // Create the complete prompt
      const prompt = `${this.systemPrompt}${this.conversationHistory.join('\n')}\nAssistant:`;

      const response = await axios.post(
        this.API_URL,
        {
          model: 'command',
          prompt: prompt,
          max_tokens: 150, 
          temperature: 0.7,
          k: 0,
          stop_sequences: ["User:", "Assistant:"],
          return_likelihoods: 'NONE',
          truncate: 'END'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      let botResponse = response.data.generations[0].text.trim();
      
      // Clean up the response
      botResponse = botResponse
        .replace(/Assistant:|User:/g, '')
        .trim();

      // Check if response is complete, if not use fallback
      if (!this.isCompleteSentence(botResponse)) {
        return this.getFallbackResponse(userMessage);
      }
      
      // Add bot response to history
      this.conversationHistory.push(`Assistant: ${botResponse}`);
      
      return { text: botResponse };
      
    } catch (error) {
      console.error('Cohere API Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }
}

export const createChatService = () => new ChatService();