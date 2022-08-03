
function nackEventsByTitle(title, numWeeks) {
  var response = [];
  var now = new Date;
  var threeWeeksFromNow = new Date(now.getTime() + (numWeeks * 7 * 24 * 60 * 60 * 1000));
  var options = {'search': title, 'statusFilters': [CalendarApp.GuestStatus.INVITED]};
  var events = CalendarApp.getEvents(now, threeWeeksFromNow, options);
  
  for (var i = 0; i < events.length; i++) {
    var evName = events[i].getTitle();
    response.push(evName);
    events[i].setMyStatus(CalendarApp.GuestStatus.NO);
  }
  return response;
}

function testNackEventsByTitle() {
  nackEventsByTitle('optional', 1);
}

function formatOptionalEvents(response) {
  var msg = '';
  if (response.length > 0) {
    msg = 'Processed: ' + response.join('<br />');
  } else {
    msg = 'No events found';
  }
  return '<pre>' + msg + '</pre>';
}

function processOptionalEventsForm(formObject) {
  var title = formObject.title;
  var numWeeks = formObject.numWeeks;
  
  return formatOptionalEvents(nackEventsByTitle(title, numWeeks));
}
