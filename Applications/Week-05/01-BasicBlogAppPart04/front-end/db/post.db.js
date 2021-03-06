const db = require('./db');

const TABLENAME = 'posts';
const USERTABLE = 'users';

class PostDb {
    static async getOne(id) {
        const query = `SELECT "posts".*, users.username as username FROM ${TABLENAME} as "posts" ` +
            `JOIN ${USERTABLE} as "users" on "posts"."user_id" = "users"."id" ` +
            `WHERE is_deleted=false AND "posts"."id" = $1`;
        const params = [id];
        console.log(query, params);
        return db.oneOrNone(query, params);
    }

    static getAll(order, by) {
        let byParam = 'created_at';
        switch (by) {
            case 'Author':
                byParam = 'username';
                break;
            case 'Updated':
                byParam = 'updated_at';
                break;
            case 'Title':
                byParam = 'title';
                break;
        }
        const query = `SELECT "posts".*, users.username as username FROM ${TABLENAME} as "posts" ` +
            `JOIN ${USERTABLE} as "users" on "posts"."user_id" = "users"."id" ` +
            `WHERE is_deleted=false ORDER BY ${byParam} ${order==='Descending' ? 'DESC' : 'ASC'}`;
        console.log(query);
        return db.any(query);
    }

    static updateOne(id, data) {
        const query = `UPDATE ${TABLENAME} SET title=$1, post=$2, updated_at=$3 WHERE is_deleted=false AND id = $4 RETURNING *`;
        const params = [data.title, data.post, new Date(), id];
        console.log(query, params);
        return db.one(query, params);
    }

    static deleteOne(id) {
        const query = `UPDATE ${TABLENAME} SET is_deleted=true WHERE id = $1`;
        const params = [id];
        console.log(query, params);
        return db.result(query, params, r => r.rowCount);
    }

    static insertOne(data, userId) {
        const query = `INSERT into ${TABLENAME} (title, post, user_id) VALUES($1, $2, $3) RETURNING *`;
        const params = [data.title, data.post, userId];
        console.log(query, params);
        return db.one(query, params);
    }

    static getTotal() {
        const query = `SELECT count(*) FROM ${TABLENAME}`;
        console.log(query);
        return db.one(query, [], a => +a.count);
    }

    static search(param) {
        let query = `SELECT * FROM ${TABLENAME} WHERE is_deleted=false AND post ILIKE '%${param}%' OR author ILIKE '%${param}%'`;
        //let query = `SELECT * FROM ${TABLENAME} WHERE is_deleted=false AND make = '${param}'`;
        console.log(query);
        return db.any(query);
    }
}

module.exports = PostDb;