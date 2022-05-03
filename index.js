import fetch from "node-fetch";
import axios from "axios";
import "dotenv/config";
import {
  initializeTag,
  getTagList,
  saveTagValue,
  initializeDataBase,
} from "./db.js";

const IOT_GATEWAY_BASE_URL = `${process.env.KEPWARE_IOT_URL}/iotgateway/`;
const BROWSE_REST_REQUEST = `${IOT_GATEWAY_BASE_URL}browse`;
const WRITE_REST_REQUEST = `${IOT_GATEWAY_BASE_URL}write`;
let READ_REST_REQUEST;

async function browse() {
  try {
    console.log(`INFO: Execute GET:${BROWSE_REST_REQUEST}`);
    const response = await fetch(BROWSE_REST_REQUEST);
    const tags = await response.json();
    tags.browseResults.forEach((tag) => {
      const tag_array = tag.id.split(".", 4);
      initializeTag(tag_array[0], tag_array[1], tag_array[2], tag_array[3]);
    });
    console.log("INFO: BROWSE has been successfully executed");
    console.log(tags);
  } catch (error) {
    console.log(error);
  }
}

async function write() {
  const param = [
    {
      id: "BeckhoffPLC.TestController.Device1.writetest",
      v: "testValue",
    },
  ];
  console.log(`INFO: Execute POST:${WRITE_REST_REQUEST}`, param);
  axios
    .post(WRITE_REST_REQUEST, param)
    .then(function (response) {
      if (response.status === 200) {
        console.log("INFO: WRITE has been successfully executed");
        console.log(response.data);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function read() {
  try {
    if (!READ_REST_REQUEST) {
      const tagList = await getTagList();
      READ_REST_REQUEST = `${IOT_GATEWAY_BASE_URL}read?`;
      tagList.forEach((tag) => {
        let readRequest = `ids=${tag.channelid}.${tag.deviceid}.${tag.taglistname}.${tag.tagname}&`;
        READ_REST_REQUEST = READ_REST_REQUEST.concat(readRequest);
      });
    }
    console.log(`INFO: Execute GET:${READ_REST_REQUEST}`);
    const response = await fetch(READ_REST_REQUEST);

    const tagsValues = await response.json();
    console.log("INFO: READ has been successfully executed");
    console.log(tagsValues);

    tagsValues.readResults.forEach((tag) => {
      const tag_array = tag.id.split(".", 4);
      saveTagValue(
        tag_array[0],
        tag_array[1],
        tag_array[2],
        tag_array[3],
        tag.v
      );
    });
  } catch (error) {
    console.log(error);
  }
}

function main() {
  console.log("INFO: Start main");
  browse();
  write();
  setInterval(read, 10000);
}

// START
console.log(`Base URL:${IOT_GATEWAY_BASE_URL}`);
initializeDataBase().then(() => main());
