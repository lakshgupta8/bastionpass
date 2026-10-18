const charSets = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

/**
 * Uniform random integer in [0, max) backed by the Web Crypto API.
 * Values past the largest multiple of `max` are rejected so that every
 * result is equally likely (a plain `% max` would bias low indices).
 */
const randomInt = (max: number): number => {
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % max;
};

const pickChar = (chars: string) => chars[randomInt(chars.length)];

const shuffle = <T>(items: T[]): T[] => {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

export const generatePassword = (
  length: number,
  options: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  },
) => {
  const enabledSets = (
    [
      [options.uppercase, charSets.uppercase],
      [options.lowercase, charSets.lowercase],
      [options.numbers, charSets.numbers],
      [options.symbols, charSets.symbols],
    ] as const
  )
    .filter(([enabled]) => enabled)
    .map(([, chars]) => chars);

  if (enabledSets.length === 0) return "";

  const validChars = enabledSets.join("");

  // One character from every enabled set is guaranteed, then the rest is
  // drawn from the combined pool and the whole result is shuffled.
  const password = enabledSets.map(pickChar);
  while (password.length < length) {
    password.push(pickChar(validChars));
  }

  return shuffle(password).slice(0, length).join("");
};

export interface StrengthResult {
  score: number;
  tier: number;
  label: string;
  color: string;
  crackTime: string;
  suggestion: string;
}

export const calculateStrength = (password: string): StrengthResult => {
  if (!password) {
    return {
      score: 0,
      tier: 0,
      label: "Very Weak",
      color: "bg-red-500",
      crackTime: "Instantly",
      suggestion: "Password is empty.",
    };
  }

  let poolSize = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumber) poolSize += 10;
  if (hasSymbol) poolSize += 30;

  let entropy = poolSize > 0 ? password.length * Math.log2(poolSize) : 0;

  if (/^(.)\1+$/.test(password)) {
    // A single repeated character carries no real entropy, whatever its length.
    entropy = 0;
  } else if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
    entropy -= 10;
  }

  let tier;
  let label;
  let color;
  let crackTime;
  let suggestion;

  if (entropy < 28) {
    tier = 0;
    label = "Very Weak";
    color = "bg-red-500";
    crackTime = "Instantly";
    suggestion = "Add different character types and increase length.";
  } else if (entropy < 36) {
    tier = 1;
    label = "Weak";
    color = "bg-orange-500";
    crackTime = "Minutes";
    suggestion = "Consider making it longer and mixing symbols/numbers.";
  } else if (entropy < 60) {
    tier = 2;
    label = "Fair";
    color = "bg-yellow-500";
    crackTime = "Days - Weeks";
    suggestion =
      password.length < 12
        ? "Increase length past 12 characters for robust security."
        : "Good password, add symbols to reach highest tier.";
  } else if (entropy < 100) {
    tier = 3;
    label = "Strong";
    color = "bg-emerald-500";
    crackTime = "Centuries";
    suggestion = "Highly secure password!";
  } else {
    tier = 4;
    label = "Unbreakable";
    color = "bg-cyan-500";
    crackTime = "Millennia+";
    suggestion = "Maximum security achieved!";
  }

  const scoreMap = [20, 40, 60, 80, 100];
  const score = scoreMap[tier];

  return {
    score,
    tier,
    label,
    color,
    crackTime,
    suggestion,
  };
};
