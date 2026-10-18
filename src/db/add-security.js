const db = require('./db');

try {
    db.prepare(`
        ALTER TABLE users
        ADD COLUMN security_question TEXT
    `).run();

    console.log('✅ security_question column added');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ security_question already exists');
    } else {
        console.error('❌ Error adding security_question:', error.message);
    }
}

try {
    db.prepare(`
        ALTER TABLE users
        ADD COLUMN security_answer TEXT
    `).run();

    console.log('✅ security_answer column added');
} catch (error) {
    if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ security_answer already exists');
    } else {
        console.error('❌ Error adding security_answer:', error.message);
    }
}

db.close();