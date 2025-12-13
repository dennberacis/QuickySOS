import { EmergencyType, GeminiAdviceResponse } from "../types";

// Offline safety advice database
const EMERGENCY_ADVICE: Record<EmergencyType, GeminiAdviceResponse> = {
  [EmergencyType.MEDICAL]: {
    steps: ["Call emergency services immediately (911/112).", "Check for breathing and pulse.", "Apply firm pressure to any bleeding."],
    safetyTip: "Do not move the person if spinal injury is suspected."
  },
  [EmergencyType.VIOLENCE]: {
    steps: ["Leave the area immediately.", "Find a lockable room or public space.", "Call emergency services when safe."],
    safetyTip: "Silence your phone and stay low/hidden."
  },
  [EmergencyType.ACCIDENT]: {
    steps: ["Move to a safe zone away from traffic.", "Check for injuries on yourself and others.", "Call emergency services."],
    safetyTip: "Do not remove helmets from injured riders."
  },
  [EmergencyType.FIRE]: {
    steps: ["Evacuate immediately via stairs (no elevators).", "Stay low to the floor to avoid smoke.", "Test doors for heat before opening."],
    safetyTip: "If trapped, seal door gaps with wet cloth."
  },
  [EmergencyType.HARASSMENT]: {
    steps: ["Head towards a crowded, well-lit area.", "Call a trusted contact or police.", "Record evidence only if safe to do so."],
    safetyTip: "Trust your instincts and leave the situation."
  },
  [EmergencyType.GENERAL]: {
    steps: [
      "Stay Calm: Keep your composure to think clearly.",
      "Assess the Situation: Evaluate any dangers around you.",
      "Know Contacts: Keep key emergency numbers handy.",
      "Be Aware: Know your exits and escape routes.",
      "Have a First Aid Kit: Keep one accessible and know its use.",
      "Stay Informed: Familiarize yourself with local emergency protocols.",
      "Speak Up: Don’t hesitate to report unsafe situations.",
      "Take Training: Get first aid, CPR, and self-defense training.",
      "Trust Your Instincts: Act if something feels wrong.",
      "Create a Plan: Have an emergency plan and practice it."
    ],
    safetyTip: "Being prepared can make a difference in emergencies."
  }
};

export const getEmergencyAdvice = async (type: EmergencyType, locationContext?: string): Promise<GeminiAdviceResponse> => {
  // Always return offline advice immediately
  return EMERGENCY_ADVICE[type] || EMERGENCY_ADVICE[EmergencyType.GENERAL];
};