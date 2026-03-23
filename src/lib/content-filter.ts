/**
 * Lightweight content filter for trending/suggested chips.
 * The site is inherently edgy — bathroom humor, getting fired, etc. is fine.
 * This only filters things that cross the line: masturbation, sex at work,
 * drug use at work, and genuinely harmful content (CSA, assault, etc.).
 * People can still translate whatever they want — this just keeps the
 * homepage suggestions from going too far.
 */

const BLOCKED_PATTERNS: RegExp[] = [
  // Profanity (too crude for suggested chips)
  /\bfuck/i,

  // Masturbation
  /\bjerking\s*(it|off|him|her)\b/i,
  /\bjack(ing|ed)?\s*off\b/i,
  /\bmasturbat/i,
  /\bjeffrey\s*toobin/i,

  // Sex at work / sexual exposure
  /\bhav(ing|e|had)\s*sex\s*(at|in|during)\s*(work|office|meeting|the office)/i,
  /\bsex\s*(at|in|during)\s*(work|office|meeting)/i,
  /\bhook(ing|ed)?\s*up\s*(at|in|during)\s*(work|office|meeting)/i,
  /\bflash(ing|ed)?\s*(my|his|her|their)\s*(penis|dick|cock|genitals|vagina|breasts|tits|boobs)\b/i,
  /\bpull(ed)?\s*(out\s*)?(my|his|her|their)\s*(penis|dick|cock)\b/i,
  /\bdick\s*pic/i,
  /\bnude(s)?\s*(at|during|in)\s*(work|office|meeting|zoom|call)/i,
  /\bnaked\s*(at|during|in)\s*(work|office|meeting|zoom|call)/i,

  // Drug use at work
  /\b(snort|sniff|smok|shoot|inject|pop)(ing|ed|s)?\s*(cocaine|coke|meth|heroin|crack|pills|oxy|fentanyl|ketamine|xanax)\s*(at|in|during)?\s*(work|office|meeting|my desk|the office)?\b/i,
  /\b(coke|cocaine|meth|heroin|crack|fentanyl)\s*(at|in|during)\s*(work|office|meeting)/i,
  /\b(high|stoned|tripping|rolling)\s*(at|in|during)\s*(work|office|meeting)/i,
  /\bdo(ing)?\s*(drugs|lines|bumps|coke|cocaine|meth)\s*(at|in|during)\s*(work|office|meeting)/i,

  // Genuinely harmful / illegal
  /\bsex(ual)?\s*(harass|assault|abuse)/i,
  /\brape[ds]?\b/i,
  /\bmolest/i,
  /\bpedophil/i,
  /\bchild\s*(porn|sex|abuse)/i,
  /\b(csam)\b/i,
  /\bbeastialit/i,
  /\bincest/i,
];

export function isContentAllowed(text: string): boolean {
  return !BLOCKED_PATTERNS.some((pattern) => pattern.test(text));
}
