export const generatePassword = (
  length: number,
  options: {
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
  },
) => {
  const charSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
  };

  let validChars = "";
  if (options.uppercase) validChars += charSets.uppercase;
  if (options.lowercase) validChars += charSets.lowercase;
  if (options.numbers) validChars += charSets.numbers;
  if (options.symbols) validChars += charSets.symbols;

  if (validChars === "") return "";

  const guaranteedChars: string[] = [];
  if (options.uppercase)
    guaranteedChars.push(
      charSets.uppercase[Math.floor(Math.random() * charSets.uppercase.length)],
    );
  if (options.lowercase)
    guaranteedChars.push(
      charSets.lowercase[Math.floor(Math.random() * charSets.lowercase.length)],
    );
  if (options.numbers)
    guaranteedChars.push(
      charSets.numbers[Math.floor(Math.random() * charSets.numbers.length)],
    );
  if (options.symbols)
    guaranteedChars.push(
      charSets.symbols[Math.floor(Math.random() * charSets.symbols.length)],
    );

  const remainingLength = length - guaranteedChars.length;
  if (remainingLength < 0) {
    return guaranteedChars.slice(0, length).join("");
  }

  const randomChars: string[] = [];
  for (let i = 0; i < remainingLength; i++) {
    randomChars.push(validChars[Math.floor(Math.random() * validChars.length)]);
  }

  const finalPassword = [...guaranteedChars, ...randomChars];

  for (let i = finalPassword.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalPassword[i], finalPassword[j]] = [finalPassword[j], finalPassword[i]];
  }

  return finalPassword.join("");
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
    entropy -= 20;
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
