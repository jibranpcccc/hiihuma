const CHUNK_SIZE = 8000;

function splitIntoChunks(text, maxSize) {
  if (text.length <= maxSize) return [text];
  
  let result = [];
  let start = 0;
  
  while (start < text.length) {
    if (text.length - start <= maxSize) {
      result.push(text.substring(start).trim());
      break;
    }
    
    let end = start + maxSize;
    let bestEnd = end;
    
    // Look backwards from maxSize to find a clean break (newline, punctuation, or space)
    for (let i = end - 1; i > start + maxSize * 0.5; i--) {
      // Prefer breaking at a double newline
      if (text[i] === '\n' && text[i-1] === '\n') {
        bestEnd = i + 1; break;
      }
    }
    
    if (bestEnd === end) {
      for (let i = end - 1; i > start + maxSize * 0.5; i--) {
        if (text[i] === '\n') {
          bestEnd = i + 1; break;
        }
      }
    }
    
    if (bestEnd === end) {
      for (let i = end - 1; i > start + maxSize * 0.5; i--) {
        if (text[i] === '.' || text[i] === '?' || text[i] === '!') {
          if (i + 1 < text.length && text[i+1] === ' ') {
            bestEnd = i + 1; break;
          }
        }
      }
    }
    
    if (bestEnd === end) {
      for (let i = end - 1; i > start + maxSize * 0.5; i--) {
        if (text[i] === ' ') {
          bestEnd = i + 1; break;
        }
      }
    }
    
    result.push(text.substring(start, bestEnd).trim());
    start = bestEnd;
  }
  
  // Filter out possible empty chunks
  return result.filter(c => c.length > 0);
}

// Create 5000 words without newlines
const word = "apple ";
const content = word.repeat(5000); // 30,000 characters

let chunks = splitIntoChunks(content, CHUNK_SIZE);

console.log("Number of chunks:", chunks.length);
for (let i = 0; i < chunks.length; i++) {
  console.log(`Chunk ${i}: ${chunks[i].length} chars`);
}
