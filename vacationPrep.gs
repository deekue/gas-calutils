/* Vacation Prep
 *
 * clean up your calendar between two dates, for things like a vacation
 */

var vacationPrep = {};

vacationPrep.counters = {
    oooDays: 0,
    holidays: 0,
    meetingDeleted: 0,
    one2oneDeleted: 0,
    myMeetingNotAttending: 0,
    meetingNotAttending: 0,
  };

vacationPrep.output = '';

vacationPrep.oooEvents = [
  'OOO',
  'OoO',
  'Out of Office',
  ];
  
vacationPrep.holidays = [
  'US Holiday',
  'Holiday',
  ];

vacationPrep.log = function(message) {
  vacationPrep.output = vacationPrep.output + '\n' + message;
};

vacationPrep.shouldIgnoreEvent = function(title) {
  // TODO check for new OoO event type, requires Advanced API
  for (var i=0; i < vacationPrep.oooEvents.length; i++) {
    if ( title.indexOf(vacationPrep.oooEvents[i]) > -1 ) {
      vacationPrep.log("....Out of office event, ignore");
      vacationPrep.counters.oooDays++;
      return true;
    }
  }
  
  for (var i=0; i < vacationPrep.holidays.length; i++) {
    if ( title.indexOf(vacationPrep.holidays[i]) > -1 ) {
      vacationPrep.log("....Holiday, ignore");
      vacationPrep.counters.holidays++;
      return true;
    }
  }

  return false;
};

vacationPrep.deleteEvent = function(event, note, dryRun) {
  vacationPrep.log("...." + note);
  if (!dryRun) {
    event.deleteEvent();
  }
};

vacationPrep.notAttending = function(event, note, dryRun) {       
  vacationPrep.log("...." + note);
  if (!dryRun) {
    event.setMyStatus(CalendarApp.GuestStatus.NO);
  }
};

vacationPrep.numGuests = function(event) {
  // return the number of human guests
  return event.getGuestList(true)
    .map(g => g.getEmail())
    .filter(e => !(e.indexOf('resource.calendar.google.com') > -1))
    .length;                            
};

vacationPrep.run = function(startDate, endDate, dryRun) {
  
  vacationPrep.log("Getting events from: " + startDate + " to " + endDate);
  var events = CalendarApp.getDefaultCalendar().getEvents(startDate, endDate);
  
  vacationPrep.log("found " + events.length + " events");
  for (var i=0; i < events.length; i++) {
    var title = events[i].getTitle();
    var numGuests = vacationPrep.numGuests(events[i]);
    vacationPrep.log(title);
        
    if (vacationPrep.shouldIgnoreEvent(title)) {
      continue;
    }
    
    if ( events[i].isOwnedByMe() ) {
      // Handle meetings I own
      vacationPrep.log("..my meeting. Guests: " + numGuests);
      if (numGuests == 0) {
        vacationPrep.deleteEvent(events[i], "reminder/placeholder, delete", dryRun);
        vacationPrep.counters.meetingDeleted++;
      } else if (numGuests == 2) {
        vacationPrep.deleteEvent(events[i], "1:1, delete", dryRun);
        vacationPrep.counters.one2oneDeleted++;
      } else {
        // I own a meeting with multiple attendees, hopefully they don't need me to continue
        vacationPrep.notAttending(events[i], "multiple guests, not attending", dryRun);
        vacationPrep.counters.myMeetingNotAttending++;
      }
    } else {
      // Handle meetings owned by others
      vacationPrep.log("..someone else's meeting. Guests: " + numGuests);
      if (numGuests == 0) {
        // I don't own this but there are no guests, reminder created by an admin?
        // delete from my calendar
        vacationPrep.deleteEvent(events[i], "reminder/placeholder, delete", dryRun);
        vacationPrep.counters.meetingDeleted++;
      } else {
        vacationPrep.notAttending(events[i], "mark as not attending", dryRun);
        vacationPrep.counters.meetingNotAttending++;
      }
    }
  }
  
  return [vacationPrep.counters, vacationPrep.output];
};

vacationPrep.formatCounters = function(counters) {
  var msg = '';
  for (key in counters) {
    if (counters.hasOwnProperty(key)) {
      msg = msg + '<br />' + key + ': ' + counters[key];
    }
  }
  return msg;
}

function processVacationPrepForm(formObject) {
  /* HTML input type=date return YYYY-MM-DD
   * these two strings will give you different results based on TZ...wtf Javascript
   * new Date("2019/02/18");
   * new Date("2019-02-18");
   */
  var startDate = new Date(formObject.startDate.replace(/-/g, '/') + " 00:01");
  var endDate = new Date(formObject.endDate.replace(/-/g, '/') + " 23:59");
  var dryRun = parseBooleanFormValue(formObject.dryRun);
  
  // TODO support overriding oooEvents and holidays
  [counters, output] = vacationPrep.run(startDate, endDate, dryRun);
  return '<pre>' + output + '<br />' + vacationPrep.formatCounters(counters) + '</pre>';
}

function manualRun() {
  var startDate = new Date("2022/05/27 00:01");
  var endDate = new Date("2022/05/30 23:59");
  var dryRun = true;
  
  [counters, output] = vacationPrep.run(startDate, endDate, dryRun);
  Logger.log(vacationPrep.formatCounters(counters));
  Logger.log(output);
}

function testGuestList() {
  var startDate = new Date("2022/05/27 00:01");
  var endDate = new Date("2022/05/30 23:59");
  var dryRun = true;
  
  vacationPrep.log("Getting events from: " + startDate + " to " + endDate);
  var events = CalendarApp.getDefaultCalendar().getEvents(startDate, endDate);
  
  vacationPrep.log("found " + events.length + " events");
  for (var i=0; i < events.length; i++) {
    var title = events[i].getTitle();
    var mine = events[i].isOwnedByMe() ? "mine" : "others";
    var guestListWithOwner = events[i].getGuestList(true).map(g => g.getEmail());
    var guestListWithoutOwner = events[i].getGuestList(false).map(g => g.getEmail());
    Logger.log("%s: %s without owner: %s, %s", title, mine,guestListWithoutOwner.length, guestListWithoutOwner);
    Logger.log("%s: %s with owner: %s, %s", title, mine, guestListWithOwner.length, guestListWithOwner);
   
  }

  
}
