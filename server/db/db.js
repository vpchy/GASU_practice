import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "archspace",
    user: "vpchy"
});

async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Подключение успешно!");
        console.log(result.rows[0]);
    } catch (err) {
        console.error("Ошибка подключения:", err);
    }
}

testConnection();

export default pool;
