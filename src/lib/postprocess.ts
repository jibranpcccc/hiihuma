import { getRandomSafeSynonym } from './synonyms';
// StealthHumanizer - Non-LLM Post-Processing Engine (Layer 2)
// Pure deterministic transformations that break AI statistical fingerprints

import { applyCollocations, applyRandomCollocation } from './collocations';

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(probability: number): boolean {
  return Math.random() < probability;
}

function splitSentences(text: string): string[] {
  return text.match(/[^.!?]*[.!?]+[\s]*/g)?.map(s => s.trim()).filter(s => s.length > 0) || [text.trim()];
}

function splitParagraphs(text: string): string[] {
  return text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 0);
}

function joinParagraphs(paragraphs: string[]): string {
  return paragraphs.join('\n\n');
}

// ==================== FRAGMENTED HEADER REMOVAL ====================
// Removes "## Heading\n\nThis section covers heading." one-liner warm-ups
function removeFragmentedHeaders(text: string): string {
  return text.replace(
    /(#{1,4}\s+.+)\n\n([^\n]{1,80})\n\n/g,
    (match, heading, oneLiner) => {
      // If the one-liner is just restating the heading (short + ends in period), remove it
      const headingWords = heading.replace(/^#+\s+/, '').toLowerCase().split(/\s+/);
      const oneLinerWords = oneLiner.toLowerCase().split(/\s+/);
      const overlap = headingWords.filter((w: string) => oneLinerWords.includes(w)).length;
      if (overlap >= 3 && oneLiner.length < 60) {
        return heading + '\n\n'; // strip the one-liner
      }
      return match;
    }
  );
}

// ==================== AGGRESSIVE AI VOCABULARY REMOVAL ====================

function aggressiveSynonymSwap(text: string): string {
  const replacements: [RegExp, string[]][] = [
    [/\bdemonstrates?\b/gi, ['shows', 'makes clear', 'reveals', 'tells us']],
    [/\bfurthermore\b/gi, ['also', 'and', 'on top of that', 'plus']],
    [/\bmoreover\b/gi, ['also', 'and', 'besides', "what's more"]],
    [/\badditionally\b/gi, ['also', 'and', 'plus', 'on top of that']],
    [/\bconsequently\b/gi, ['so', 'which means', 'as a result', 'because of that']],
    [/\bsignificantly\b/gi, ['a lot', 'noticeably', 'quite a bit', 'really']],
    [/\bsubstantially\b/gi, ['a lot', 'quite a bit', 'in a big way']],
    [/\bnotably\b/gi, ['especially', 'worth pointing out', 'interestingly']],
    [/\bremarkably\b/gi, ['surprisingly', 'pretty amazing', 'kind of wild']],
    [/\bparticularly\b/gi, ['especially', 'mainly', 'mostly']],
    [/\bessentially\b/gi, ['basically', 'at its core', 'when you get down to it']],
    [/\bfundamentally\b/gi, ['basically', 'at its core', 'really']],
    [/\bultimately\b/gi, ['in the end', 'at the end of the day', 'when all is said and done']],
    [/\binherently\b/gi, ['naturally', 'by its nature', 'built into it']],
    [/\butilize\b/gi, ['use', 'work with', 'make use of']],
    [/\bfacilitate\b/gi, ['help with', 'make easier', 'enable']],
    [/\bleverage\b/gi, ['use', 'take advantage of', 'build on']],
    [/\boptimize\b/gi, ['improve', 'make better', 'fine-tune']],
    [/\bimplement\b/gi, ['set up', 'put in place', 'start using']],
    [/\bcomprehensive\b/gi, ['thorough', 'complete', 'full']],
    [/\binnovative\b/gi, ['new', 'fresh', 'creative', 'different']],
    [/\btransformative\b/gi, ['game-changing', 'really big', 'major']],
    [/\bunprecedented\b/gi, ['never seen before', 'completely new', 'totally unusual']],
    [/\bstreamline\b/gi, ['simplify', 'make smoother', 'speed up']],
    [/\bcrucial\b/gi, ['key', 'important', 'really matters']],
    [/\bpivotal\b/gi, ['key', 'important', 'central']],
    [/\bit is evident that\b/gi, ['clearly', 'obviously', 'you can see that']],
    [/\bit is clear that\b/gi, ['clearly', 'obviously']],
    [/\bplays? a crucial role\b/gi, ['matters a lot', 'is really important', 'makes a big difference']],
    [/\bplays? an important role\b/gi, ['matters', 'is important', 'makes a difference']],
    [/\bhas the potential to\b/gi, ['could', 'might', 'stands to']],
    [/\bin today's world\b/gi, ['now', 'these days', 'right now']],
    [/\bin the modern era\b/gi, ['now', 'these days']],
    [/\bin conclusion\b/gi, ['']],
    [/\bin summary\b/gi, ['']],
    [/\bto summarize\b/gi, ['']],
    [/\bit is important to note\b/gi, ['']],
    [/\bit is worth noting\b/gi, ['']],
    [/\bit is worth mentioning\b/gi, ['']],
    [/\bdelves? into\b/gi, ['looks at', 'digs into', 'explores']],
    [/\blandscape\b/gi, ['space', 'area', 'world', 'field']],
    [/\bmultifaceted\b/gi, ['complex', 'complicated', 'many-sided']],
    [/\bembark on a journey\b/gi, ['start', 'begin', 'get into']],
    [/\bseamless(ly)?\b/gi, ['smooth', 'easy', 'natural']],
    [/\bnumerous\b/gi, ['many', 'a lot of', 'tons of']],
    [/\ba variety of\b/gi, ['different', 'various', 'all kinds of']],
    [/\ba multitude of\b/gi, ['many', 'a lot of', 'tons of']],
    [/\ba significant number of\b/gi, ['many', 'a lot of']],
  ];

  let result = text;
  for (const [pattern, alternatives] of replacements) {
    result = result.replace(pattern, () => randomPick(alternatives));
  }
  return result;
}


// ==================== WORD-LEVEL SYNONYM SWAPPING (from StealthHumanizer) ====================
function swapSynonyms(text: string): string {
  const words = text.split(/(\s+)/);
  const result: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word || /^\s+$/.test(word) || /^[^a-zA-Z]+$/.test(word) || word.length < 4) {
      result.push(word);
      continue;
    }
    if (word === word.toUpperCase()) {
      result.push(word);
      continue;
    }
    if (Math.random() < 0.25) {
      const synonym = getRandomSafeSynonym(word);
      if (synonym) {
        if (/^[A-Z]/.test(word) && /^[a-z]/.test(synonym)) {
          result.push(synonym.charAt(0).toUpperCase() + synonym.slice(1));
        } else {
          result.push(synonym);
        }
        continue;
      }
    }
    result.push(word);
  }
  return result.join('');
}

// ==================== FILLER PHRASES (human conversational rhythm) ====================
const FILLER_PHRASES = [
  'in my experience,',
  "from what I've seen,",
  "I'd argue that",
  'honestly,',
  'the way I see it,',
  'from my perspective,',
  'if you think about it,',
  'interestingly,',
  'to be fair,',
  'in practice,',
  'at least in my view,',
  'one thing that stands out is',
  'what strikes me is',
  "it's worth pointing out that",
  'as far as I can tell,',
];
// ==================== SENTENCE LENGTH MANIPULATION ====================

function manipulateSentenceLengths(text: string): string {
  const paragraphs = splitParagraphs(text);
  
  return paragraphs.map(p => {
    if (p.startsWith('#') || p.startsWith('-') || p.startsWith('*') || p.startsWith('>')) {
      return p;
    }

    const sentences = splitSentences(p);
    const result: string[] = [];

    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      const words = sentence.trim().split(/\s+/);
      const wc = words.length;

      // Merge two consecutive short sentences (both < 8 words) with 15% chance
      if (
        wc < 8 && i < sentences.length - 1 &&
        sentences[i + 1].trim().split(/\s+/).length < 8 &&
        chance(0.05)
      ) {
        const next = sentences[i + 1].trim();
        const conjunction = randomPick(['and', 'but', 'so']);
        const merged = sentence.trim().replace(/[.!?]+$/, '') + ', ' + conjunction + ' ' +
          next.charAt(0).toLowerCase() + next.slice(1);
        result.push(merged);
        i++;
        continue;
      }

      // Split long sentences (>30 words) at a natural break point with 25% chance
      if (wc > 30 && chance(0.25)) {
        const breakPatterns = [
          /,\s+(?:and|but|or|while)\s+/gi,
          /,\s+(?:which|that|where|when|who)\s+/gi,
        ];

        let found = false;
        for (const pattern of breakPatterns) {
          const match = sentence.match(pattern);
          if (match && match.index !== undefined && match.index > 10 && match.index < sentence.length - 10) {
            const first = sentence.slice(0, match.index).replace(/[,:]$/, '');
            const second = sentence.slice(match.index).replace(/^,?\s*/, '');
            const secondCapitalized = second.charAt(0).toUpperCase() + second.slice(1);
            result.push(first + '. ' + secondCapitalized);
            found = true;
            break;
          }
        }
        if (found) continue;
      }

      // 15% chance to prepend a filler phrase to longer sentences
      if (words.length > 15 && chance(0.15)) {
        const filler = randomPick(FILLER_PHRASES);
        const lowered = sentence.charAt(0).toLowerCase() + sentence.slice(1);
        result.push(filler + ' ' + lowered);
        continue;
      }

      result.push(sentence);
    }

    return result.join(' ');
  }).join('\n\n');
}

// ==================== FLOW DISRUPTION ====================

function disruptFlow(text: string): string {
  const paragraphs = splitParagraphs(text);
  return paragraphs.map(p => {
    if (p.startsWith('#') || p.startsWith('-') || p.startsWith('*') || p.startsWith('>')) {
      return p;
    }

    const sentences = splitSentences(p);
    if (sentences.length < 2) return p;

    const result = [...sentences];

    // 10% chance: start with a conjunction
    if (chance(0.10)) {
      const conjunctions = ['And ', 'But ', 'So '];
      const alreadyStartsWithConjunction = /^(And|But|So|Or|Yet)\b/i.test(result[0]);
      if (!alreadyStartsWithConjunction) {
        result[0] = randomPick(conjunctions) + result[0].charAt(0).toLowerCase() + result[0].slice(1);
      }
    }

    return result.join(' ');
  }).join('\n\n');
}

// ==================== PUNCTUATION NOISE ====================

function addPunctuationNoise(text: string): string {
  let result = text;

  // 5% chance: em-dash instead of comma
  if (chance(0.05)) {
    const commas = Array.from(result.matchAll(/,\s/g));
    if (commas.length > 0) {
      const c = randomPick(commas);
      if (c.index !== undefined) {
        const before = result.slice(0, c.index);
        const after = result.slice(c.index + c[0].length);
        result = before + '—' + after;
      }
    }
  }

  // 5% chance: semicolon between related sentences
  if (chance(0.05)) {
    const periodSpaces = Array.from(result.matchAll(/\.\s+(?=[A-Z])/g));
    if (periodSpaces.length > 0) {
      const p = randomPick(periodSpaces);
      if (p.index !== undefined && p.index > 0) {
        const before = result.slice(0, p.index);
        const after = result.slice(p.index + p[0].length);
        result = before + '; ' + after.charAt(0).toLowerCase() + after.slice(1);
      }
    }
  }

  return result;
}


// ==================== SENTENCE REORDERING (from StealthHumanizer) ====================
function reorderSentences(paragraph: string): string {
  const sentences = splitSentences(paragraph);
  if (sentences.length <= 2) return paragraph;

  const pronounPattern = /\b(he|she|it|they|this|that|these|those|his|her|its|their)\b/i;

  const middle = sentences.slice(1, -1);
  if (middle.length <= 1) return paragraph;

  const swapCount = Math.max(1, Math.floor(middle.length * (0.2 + Math.random() * 0.1)));
  const result = [...middle];

  for (let s = 0; s < swapCount; s++) {
    const i = Math.floor(Math.random() * result.length);
    let j = Math.floor(Math.random() * result.length);
    while (j === i && result.length > 1) j = Math.floor(Math.random() * result.length);
    if (i === j) continue;

    const sentenceI = result[i];
    const sentenceJ = result[j];

    if (pronounPattern.test(sentenceI.split(' ')[0]) || pronounPattern.test(sentenceJ.split(' ')[0])) {
      if (chance(0.5)) continue;
    }

    [result[i], result[j]] = [result[j], result[i]];
  }

  return [sentences[0], ...result, sentences[sentences.length - 1]].join(' ');
}
// ==================== PARAGRAPH STRUCTURE RANDOMIZATION ====================

function randomizeParagraphs(text: string): string {
  const paragraphs = splitParagraphs(text);
  if (paragraphs.length <= 1) return text;

  const result: string[] = [];

  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i];
    
    if (p.startsWith('#') || p.startsWith('-') || p.startsWith('*') || p.startsWith('>')) {
      result.push(p);
      continue;
    }

    const sentences = splitSentences(p);

    // 15% chance to split a paragraph into two
    if (sentences.length >= 4 && chance(0.07)) {
      const splitPoint = 1 + Math.floor(Math.random() * (sentences.length - 2));
      const first = sentences.slice(0, splitPoint).join(' ');
      const second = sentences.slice(splitPoint).join(' ');
      result.push(first);
      result.push(second);
      continue;
    }

    result.push(p);
  }

  return joinParagraphs(result);
}

// ==================== MAIN POST-PROCESS FUNCTION ====================

/**
 * Apply all non-LLM post-processing transformations to humanized text.
 * This runs AFTER the AI rewrite to further break statistical fingerprints.
 */

// ==================== HUMAN VOICE INJECTION (from StealthHumanizer) ====================
function injectHumanVoice(text: string): string {
  let result = text;

  // Deterministic contraction expansion
  const expansions: [RegExp, string][] = [
    [/\bdo not\b/gi, "don't"],
    [/\bcannot\b/gi, "can't"],
    [/\bcan not\b/gi, "can't"],
    [/\bwill not\b/gi, "won't"],
    [/\bis not\b/gi, "isn't"],
    [/\bare not\b/gi, "aren't"],
    [/\bit is\b/g, "it's"],
    [/\bthat is\b/g, "that's"],
    [/\bthere is\b/g, "there's"],
    [/\bwe are\b/gi, "we're"],
    [/\bthey are\b/gi, "they're"],
    [/\bI am\b/g, "I'm"],
    [/\bwould not\b/gi, "wouldn't"],
    [/\bshould not\b/gi, "shouldn't"],
    [/\bcould not\b/gi, "couldn't"],
    [/\bdid not\b/gi, "didn't"],
    [/\bdoes not\b/gi, "doesn't"],
    [/\bhave not\b/gi, "haven't"],
    [/\bhas not\b/gi, "hasn't"],
  ];

  // Apply contractions with ~70% probability each
  for (const [pattern, replacement] of expansions) {
    if (chance(0.70)) {
      result = result.replace(pattern, replacement);
    }
  }

  // 10% chance: start a random mid-paragraph sentence with a conjunction
  if (chance(0.10)) {
    const paragraphs = splitParagraphs(result);
    const pIdx = Math.floor(Math.random() * paragraphs.length);
    const sentences = splitSentences(paragraphs[pIdx]);
    if (sentences.length > 1) {
      const sIdx = 1 + Math.floor(Math.random() * (sentences.length - 1));
      const conjunction = randomPick(['And', 'But', 'So', 'Plus', 'Yet']);
      sentences[sIdx] = conjunction + ' ' + sentences[sIdx].charAt(0).toLowerCase() + sentences[sIdx].slice(1);
      paragraphs[pIdx] = sentences.join(' ');
      result = joinParagraphs(paragraphs);
    }
  }

  // 5% chance: inject a parenthetical aside before a late sentence period
  if (chance(0.05)) {
    const asides = [
      'which is interesting', 'interestingly enough', 'if you think about it',
      "at least that's the idea", 'in my view', 'for what it's worth',
      'honestly', 'which makes sense when you think about it'
    ];
    const aside = randomPick(asides);
    const lastPeriod = result.lastIndexOf('.');
    if (lastPeriod > 40) {
      result = result.slice(0, lastPeriod) + ` (${aside})` + result.slice(lastPeriod);
    }
  }

  return result;
}

// ==================== TRANSITION WORD FREQUENCY CONTROL ====================
function adjustTransitionFrequency(text: string): string {
  const words = text.split(/\s+/).length;
  const transitionWords = [
    'however', 'therefore', 'moreover', 'furthermore', 'additionally',
    'consequently', 'nevertheless', 'meanwhile', 'subsequently', 'thus',
    'hence', 'accordingly', 'similarly', 'likewise', 'conversely'
  ];

  let currentTransitions = 0;
  const lower = text.toLowerCase();
  for (const w of transitionWords) {
    const matches = lower.match(new RegExp(`\\b${w}\\b`, 'g'));
    if (matches) currentTransitions += matches.length;
  }

  const per1000 = (currentTransitions / Math.max(words, 1)) * 1000;

  // Human average is ~4-6 transitions per 1000 words
  // If we're over 9 per 1000 (1.5x average), remove 30%
  if (per1000 > 9) {
    let result = text;
    let toRemove = Math.floor(currentTransitions * 0.3);
    for (const w of transitionWords) {
      if (toRemove <= 0) break;
      const regex = new RegExp(`\\b${w}\\b[,]?\\s*`, 'gi');
      result = result.replace(regex, (match) => {
        if (toRemove > 0) { toRemove--; return ''; }
        return match;
      });
    }
    return result.replace(/  +/g, ' ').replace(/\.\s*\./g, '.');
  }
  return text;
}

// ==================== INVISIBLE CHARACTER INJECTION (breaks n-gram fingerprinting) ====================
export function addInvisibleCharacters(text: string): string {
  const invisibleChars = ['\u200B', '\u200C', '\u200D', '\uFEFF'];
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    if (i % 7 === 0 && word.trim().length > 3 && !/^[#*`]/.test(word)) {
      const char = invisibleChars[Math.floor(Math.random() * invisibleChars.length)];
      const pos = Math.floor(word.length * 0.6);
      return word.slice(0, pos) + char + word.slice(pos);
    }
    return word;
  }).join('');
}
export function postprocess(text: string): string {
  let result = text;

  // 0. Remove fragmented heading warmups
  result = removeFragmentedHeaders(result);

  // 1. Aggressive AI vocabulary removal
  // Early light synonym pass (double-pass = StealthHumanizer strategy)
  if (chance(0.5)) result = swapSynonyms(result);

  result = swapSynonyms(result);
  result = aggressiveSynonymSwap(result);

  // 2. Collocation replacements (150+ AI phrase → human phrase)
  result = applyCollocations(result);

  // 3. Sentence length manipulation
  result = manipulateSentenceLengths(result);

  // 4. Flow disruption
  result = disruptFlow(result);

  // 5. Punctuation noise
  result = addPunctuationNoise(result);

  // 6. Paragraph randomization
  result = randomizeParagraphs(result);

  // Sentence reordering within paragraphs
  const _paragraphs = splitParagraphs(result);
  result = joinParagraphs(_paragraphs.map(p => reorderSentences(p)));

  // Human voice: contractions, conjunction starters, parentheticals
  result = injectHumanVoice(result);

  // Transition frequency control — trim AI overuse of 'however/therefore/moreover'
  result = adjustTransitionFrequency(result);

  // 7. Additional random collocation passes
  for (let i = 0; i < 3; i++) {
    result = applyRandomCollocation(result);
  }

  // 8. Clean up
  // Invisible character injection — breaks byte-level n-gram fingerprinting
  result = addInvisibleCharacters(result);

  result = result
    .replace(/  +/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\.+\./g, '.')
    .trim();


  // 9. Soft-landing phrase detection and cleanup
  const SOFT_LANDING_PHRASES = [
    "one of those things",
    "way better to figure out",
    "this isn't a skill issue",
    "kind of funny, actually",
    "might be exactly what you want",
    "starts bold and mellows",
    "can actually deliver that perfectly",
    "it's worth thinking about",
    "before you finalize your decision",
    "only you can decide",
    "it depends on your",
    "either option could work",
    "at the end of the day",
    "ultimately, it's up to you",
  ];
  for (const phrase of SOFT_LANDING_PHRASES) {
    if (result.toLowerCase().includes(phrase.toLowerCase())) {
      console.warn('[humanize] Soft-landing phrase detected:', phrase);
    }
  }


  // 10. Fix unclosed bold markdown headers (e.g. **Title without closing **)
  result = result.replace(/\*\*([^\n*]+)(?<!\*\*)\n/g, (match, title) => {
    if (!match.trimEnd().endsWith('**')) {
      return '**' + title.trim() + '**\n';
    }
    return match;
  });

  return result;
}
