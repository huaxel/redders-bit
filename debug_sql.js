import initSqlJs from 'sql.js';

async function test() {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run("CREATE TABLE test (val TEXT)");
    
    try {
        console.log("Trying undefined...");
        db.run("INSERT INTO test VALUES (?)", [undefined]);
        console.log("Success undefined");
    } catch (e) {
        console.error("Failed undefined:", e.message);
    }
    
    try {
        console.log("Trying null...");
        db.run("INSERT INTO test VALUES (?)", [null]);
        console.log("Success null");
    } catch (e) {
        console.error("Failed null:", e.message);
    }
}

test();
