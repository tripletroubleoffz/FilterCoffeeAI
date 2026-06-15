import { startWorkers, initQueues } from '../lib/queue';

console.log('==================================================');
console.log('FILTERCOFFEE.AI - BACKGROUND WORKER INSTANCE');
console.log('Initializing queues and listeners...');
console.log('==================================================');

try {
  initQueues();
  startWorkers();
} catch (error) {
  console.error('Failed to initialize or boot worker node:', error);
  process.exit(1);
}
