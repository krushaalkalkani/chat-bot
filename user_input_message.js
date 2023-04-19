const { google } = require("googleapis");
const readline = require("readline");
require("dotenv").config();

// Provide the required configuration
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = "https://www.googleapis.com/auth/calendar";
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

// Your TIMEOFFSET Offset
const TIMEOFFSET = "+05:30";

// Get date-time string for calendar
const dateTimeForCalander = () => {
  let date = new Date();

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  if (month < 10) {
    month = `0${month}`;
  }
  let day = date.getDate();
  if (day < 10) {
    day = `0${day}`;
  }
  let hour = date.getHours();
  if (hour < 10) {
    hour = `0${hour}`;
  }
  let minute = date.getMinutes();
  if (minute < 10) {
    minute = `0${minute}`;
  }

  let newDateTime = `${year}-${month}-${day}T${hour}:${minute}:00.000${TIMEOFFSET}`;

  let event = new Date(Date.parse(newDateTime));

  let startDate = event;
  // Delay in end time is 1
  let endDate = new Date(
    new Date(startDate).setHours(startDate.getHours() + 1)
  );

  return {
    start: startDate,
    end: endDate,
  };
};

// Insert new event to Google Calendar
const insertEvent = async (event) => {
  try {
    let response = await calendar.events.insert({
      auth: auth,
      calendarId: calendarId,
      resource: event,
    });

    if (response["status"] == 200 && response["statusText"] === "OK") {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return 0;
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt user for event details
rl.question("Event Name: ", (eventName) => {
  rl.question("Event Description: ", (eventDescription) => {
    // Generate date-time for calendar
    let dateTime = dateTimeForCalander();

    // Event for Google Calendar
    let event = {
      summary: eventName,
      description: eventDescription,
      start: {
        dateTime: dateTime["start"],
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: dateTime["end"],
        timeZone: "Asia/Kolkata",
      },
    };

    insertEvent(event)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });

    // Close the readline interface
    rl.close();
  });
});
