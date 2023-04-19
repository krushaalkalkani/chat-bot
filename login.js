const CLIENT_ID =
   "15608422794-s4932alj3n426j54mlkluoq1cvhhn26q.apps.googleusercontent.com";
 const API_KEY = "AIzaSyBmL9Oz6zHe6DgaBBKbyd26WcF-z3bQUIo";

const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

let tokenClient;
let gapiInited = false;
let gisInited = false;

// document.getElementById("login").style.visibility = "hidden";
// document.getElementById("signout_button").style.visibility = "hidden";

function gapiLoaded() {
  gapi.load("client", initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: "",
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById("login").style.visibility = "visible";
  }
}

// function handleAuthClick() {
//   tokenClient.callback = async (resp) => {
//     if (resp.error !== undefined) {
//       throw resp;
//     }
//     document.getElementById("signout_button").style.visibility = "visible";
//     document.getElementById("login").style.visibility = "hidden";
//     // window.location.href = "www.google.com"; 
//     await listUpcomingEvents();
//   };

//   if (gapi.client.getToken() === null) {
//     tokenClient.requestAccessToken({ prompt: "consent" });
//   } else {
//     tokenClient.requestAccessToken({ prompt: "" });
//   }
// }

async function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw resp;
    }
    // Hide the login button
    document.getElementById("login").style.display = "none";
    // Call the function to list upcoming events
    await listUpcomingEvents();
  };

  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({ prompt: "consent" });
  } else {
    tokenClient.requestAccessToken({ prompt: "" });
  }
}

function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken("");
    document.getElementById("content").innerText = "";
    document.getElementById("login").innerText = "Authorize";
    // Show the login button
    document.getElementById("login").style.display = "block";
  }
}

// function handleAuthClick() {
//   tokenClient.callback = async (resp) => {
//     if (resp.error !== undefined) {
//     throw resp;
//     }
//     {
       
//     // document.getElementById("signout_button").style.visibility = "visible";
//     document.getElementById("login").style.visibility = "hidden";
//     await listUpcomingEvents();
//   }

  
//   };

//   if (gapi.client.getToken() === null) {
//     tokenClient.requestAccessToken({ prompt: "consent" });
//   } else {
//     tokenClient.requestAccessToken({ prompt: "" });
//   }
// }

// function handleSignoutClick() {
//   const token = gapi.client.getToken();
//   if (token !== null) {
//     google.accounts.oauth2.revoke(token.access_token);
//     gapi.client.setToken("");
//     document.getElementById("content").innerText = "";
//     document.getElementById("login").innerText = "Authorize";
//     // document.getElementById("signout_button").style.visibility = "hidden";
//   }
// }


async function listUpcomingEvents() {
  let response;
  try {
    const request = {
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    };
    response = await gapi.client.calendar.events.list(request);
  } catch (err) {
    document.getElementById("content").innerText = err.message;
    return;
  }

  const events = response.result.items;
  if (!events || events.length == 0) {
    document.getElementById("content").innerText = "No events found.";
    return;
  }
  // Flatten to string to display
  const output = events.reduce(
    (str, event) =>
      `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
    "Events:\n"
  );
  document.getElementById("content").innerText = output;
}
function loadCalendarEvents() {
  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    events: function (fetchInfo, successCallback, failureCallback) {
      var request = gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: fetchInfo.start.toISOString(),
        timeMax: fetchInfo.end.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: "startTime",
      });

      request.execute(function (response) {
        var events = [];
        if (response.items && response.items.length > 0) {
          for (var i = 0; i < response.items.length; i++) {
            var event = response.items[i];
            events.push({
              title: event.summary,
              start: event.start.dateTime || event.start.date,
              end: event.end.dateTime || event.end.date,
              description: event.description,
              location: event.location,
              attendees: event.attendees,
            });
          }
        }
        successCallback(events);
      });
    },
  });
  calendar.render();
}

function handleFormSubmit(event) {
  event.preventDefault();
  // Get the form values
  var title = document.getElementById("title").value;
  var location = document.getElementById("location").value;
  var description = document.getElementById("description").value;
  var date = document.getElementById("date").value;
  var time = document.getElementById("time").value;
  var attendees = document.getElementById("attendees").value.split(",");

  // Create a start and end time for the event
  var startTime = moment(date + " " + time).format();
  var endTime = moment(date + " " + time)
    .add(1, "hours")
    .format();

  // Create the event object
  var event = {
    summary: title,
    location: location,
    description: description,
    start: {
      dateTime: startTime,
      timeZone: "YOUR_TIMEZONE",
    },
    end: {
      dateTime: endTime,
      timeZone: "YOUR_TIMEZONE",
    },
    attendees: [],
  };

  // Add attendees to the event object
  for (var i = 0; i < attendees.length; i++) {
    var attendeeEmail = attendees[i].trim();
    if (attendeeEmail !== "") {
      event.attendees.push({ email: attendeeEmail });
    }
  }

  // Insert the event into the Google Calendar
  var request = gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  request.execute(function (event) {
    console.log("Event created: " + event.htmlLink);
    alert("Event created: " + event.htmlLink);
    document.getElementById("title").value = "";
    document.getElementById("location").value = "";
    document.getElementById("description").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("attendees").value = "";
    loadCalendarEvents();
  });
}

// Load the Google API client library
gapi.load("client", init);


// const CLIENT_ID = "YOUR_CLIENT_ID"; // Replace with your own client ID
// const API_KEY = "YOUR_API_KEY"; // Replace with your own API key

// const DISCOVERY_DOC = "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest";

// const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

// let tokenClient;
// let gapiInited = false;
// let gisInited = false;

// // document.getElementById("login").style.visibility = "hidden";
// // document.getElementById("signout_button").style.visibility = "hidden";

// function gapiLoaded() {
//   gapi.load("client", initializeGapiClient);
// }

// async function initializeGapiClient() {
//   await gapi.client.init({
//     apiKey: API_KEY,
//     discoveryDocs: [DISCOVERY_DOC],
//   });
//   gapiInited = true;
//   maybeEnableButtons();
// }

// function gisLoaded() {
//   tokenClient = google.accounts.oauth2.initTokenClient({
//     client_id: CLIENT_ID,
//     scope: SCOPES,
//     callback: "",
//   });
//   gisInited = true;
//   maybeEnableButtons();
// }

// function maybeEnableButtons() {
//   if (gapiInited && gisInited) {
//     document.getElementById("login").style.visibility = "visible";
//   }
// }

// function handleAuthClick() {
//   tokenClient.callback = async (resp) => {
//     if (resp.error !== undefined) {
//       window.location.href = 'https://example.com'; 
//       // document.getElementById("signout_button").style.visibility = "visible";
//       document.getElementById("login").style.visibility = "hidden";
//       await listUpcomingEvents();
//       throw resp;
//     }
//   };

//   if (gapi.client.getToken() === null) {
//     tokenClient.requestAccessToken({ prompt: "consent" });
//   } else {
//     tokenClient.requestAccessToken({ prompt: "" });
//   }
// }

// function handleSignoutClick() {
//   const token = gapi.client.getToken();
//   if (token !== null) {
//     google.accounts.oauth2.revoke(token.access_token);
//     gapi.client.setToken("");
//     document.getElementById("content").innerText = "";
//     document.getElementById("login").innerText = "Authorize";
//     // document.getElementById("signout_button").style.visibility = "hidden";
//   }
// }

// async function listUpcomingEvents() {
//   let response;
//   try {
//     const request = {
//       calendarId: "primary",
//       timeMin: new Date().toISOString(),
//       showDeleted: false,
//       singleEvents: true,
//       maxResults: 10,
//       orderBy: "startTime",
//     };
//     response = await gapi.client.calendar.events.list(request);
//   } catch (err) {
//     document.getElementById("content").innerText = err.message;
//     return;
//   }

//   const events = response.result.items;
//   if (!events || events.length == 0) {
//     document.getElementById("content").innerText = "No events found.";
//     return;
//   }
//   // Flatten to string to display
//   const output = events.reduce(
//     (str, event) =>
//       `${str}${event.summary} (${event.start.dateTime || event.start.date})\n`,
//     "Events:\n"
//   );
//   document.getElementById("content").innerText = output;
// }

// function loadCalendarEvents() {
//   var calendarEl = document.getElementById("calendar");
//   var calendar = new FullCalendar.Calendar(calendarEl, {
//     initialView: "dayGridMonth",
//     events: function (fetchInfo, successCallback, failureCallback) {
//       var request = gapi.client.calendar.events.list({
//         calendarId: "primary",
//         timeMin: fetchInfo.start.toISOString(),
//         timeMax: fetchInfo.end.toISOString(),
//         showDeleted: false,
//         singleEvents: true,
//         maxResults: 10,
//         orderBy: "startTime",
//         });
//         request.execute(function (response) {
//           var events = [];
//           if (response.items && response.items.length > 0) {
//             for (var i = 0; i < response.items.length; i++) {
//               var item = response.items[i];
//               var event = {
//                 title: item.summary,
//                 start: item.start.dateTime || item.start.date,
//                 end: item.end.dateTime || item.end.date,
//               };
//               events.push(event);
//             }
//           }
//           successCallback(events);
//         });
//       },
//     });
//     calendar.render();
//     }
    
//     document.getElementById("login").addEventListener("click", handleAuthClick);
//     // document.getElementById("signout_button").addEventListener("click", handleSignoutClick); // Uncomment this line if you want to enable signout functionality
//     document.getElementById("load_calendar_button").addEventListener("click", loadCalendarEvents);      
