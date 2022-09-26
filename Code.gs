/**
 * HTML functions
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function parseBooleanFormValue(str) {
  if (!str) {
    return false;
  }
  if (typeof str == 'string') {
    str = str.trim().toLowerCase();
  }
  if (str == 'false' || str == '0') {
      return false;
  }
  return !!str;
}      
      
/**
 * Lists the calendars shown in the user's calendar list.
 * @see https://developers.google.com/calendar/api/v3/reference/calendarList/list
 */
function listCalendars() {
  var calendars;
  var response = {};
  var pageToken;
  do {
    calendars = Calendar.CalendarList.list({
      maxResults: 100,
      pageToken: pageToken
    });
    if (!calendars.items || calendars.items.length === 0) {
      Logger.log('No calendars found.');
    } else {
      for (const calendar of calendars.items) {
        response[calendar.id] = calendar.summary;
        Logger.log('%s (ID: %s)', calendar.summary, calendar.id);
      }
    }
    pageToken = calendars.nextPageToken;
  } while (pageToken);
  return response;
}
