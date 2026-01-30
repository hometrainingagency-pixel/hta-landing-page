import { createHash } from 'crypto';
import { writeFileSync } from 'fs';

const hash = createHash('sha256').update('trainingtogether').digest('hex');
writeFileSync('temp_hash.txt', hash);
console.log('Hash written to temp_hash.txt');
