/**
 * Deneb.
 *
 * Various utilities.
 *
 * @module utils
 * @license Apache-2.0
 */




import { join } from "path"
import { realpathSync } from "fs"
import pg from "pg-promise"




/**
 * QueryFiles linking helper with memoization.
 *
 * @function sql
 * @param {String} dirname directory path containing SQL file
 * @param {String} file SQL file name
 * @returns {QueryFile}
 */
export const sql = ((qfs) =>
    (dirname, file) => {
        if (!(file in qfs)) {
            qfs[file] = new pg.QueryFile(
                join(realpathSync(dirname), file), { minify: true }
            )
        }
        return qfs[file]
    }
)({})
