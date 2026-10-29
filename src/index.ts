import { startCLI } from './cli';
import { seedDatabase } from './storage/seed';

seedDatabase();
void startCLI();
