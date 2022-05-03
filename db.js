import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

const initializeDataBase = async () => {
  try {
    await pool.query("CREATE SCHEMA IF NOT EXISTS iot");
    await pool.query(
      "CREATE TABLE IF NOT EXISTS iot.taglist(channelId text NOT NULL, deviceId text NOT NULL, tagListName text NOT NULL, tagName text NOT NULL, createTagTime timestamptz NOT NULL, tagValue text, lastupdatetagValuetime timestamptz)"
    );
    await pool.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS taglist_channelId_idx ON iot.taglist USING btree (channelId, deviceId, tagListName, tagName)"
    );
    console.log("INFO: successfully initialized database");
  } catch (error) {
    console.log(error);
  }
};

const initializeTag = async (channelId, deviceId, tagListName, tagName) => {
  try {
    const response = await pool.query(
      "SELECT * FROM  iot.taglist WHERE channelid = $1 and deviceid = $2 and taglistname = $3 and tagname = $4",
      [channelId, deviceId, tagListName, tagName]
    );

    if (!response.rows[0]) {
      const response = await pool.query(
        "INSERT INTO iot.taglist(channelid, deviceid, taglistname, tagname, createtagtime) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
        [channelId, deviceId, tagListName, tagName]
      );

      console.log(
        `INFO: Saved to DB PLC tag definition: ${response.rows[0].channelid}.${response.rows[0].deviceid}.${response.rows[0].taglistname}.${response.rows[0].tagname}`
      );
    } else {
      console.log(
        `WARNING: Tag already exist: ${response.rows[0].channelid}.${response.rows[0].deviceid}.${response.rows[0].taglistname}.${response.rows[0].tagname}  initialize tag time:${response.rows[0].createtagtime}`
      );
    }
  } catch (error) {
    console.log(error);
  }
};

const saveTagValue = async (
  channelId,
  deviceId,
  tagListName,
  tagName,
  tagValue
) => {
  const response = await pool.query(
    "UPDATE iot.taglist SET tagvalue = $5 , lastupdatetagvaluetime = NOW() WHERE channelid = $1 and deviceid = $2 and taglistname = $3 and tagname = $4 RETURNING *",
    [channelId, deviceId, tagListName, tagName, tagValue]
  );
  console.log(
    `INFO: Saved to DB tag value: ${response.rows[0].channelid}.${response.rows[0].deviceid}.${response.rows[0].taglistname}.${response.rows[0].tagname}, value: ${response.rows[0].tagvalue}`
  );
};

const getTagList = async () => {
  const response = await pool.query("SELECT * FROM  iot.taglist ", []);

  if (!response.rows[0]) {
    throw "ERROR: Tags were not initialized, call browse method first";
  } else {
    return response.rows;
  }
};

export { initializeTag, getTagList, saveTagValue, initializeDataBase };
