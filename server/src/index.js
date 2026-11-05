import { PORT, DB_PATH } from './config.js';
import { openDatabase } from './db.js';
import { createApp } from './app.js';

const db = openDatabase();
const app = createApp(db);

app.listen(PORT, () => {
  console.log(`Database SQLite : ${DB_PATH}`);
  console.log(`Server berjalan : http://localhost:${PORT}`);
});
