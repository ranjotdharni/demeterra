# demeterra
Web app to help manage employee hours.

## To Do
[ ] Edit Dates
[ ] Copy Groups
[ ] Nav Bar
[ ] Statistics

## Notes
- Setting environment TZ variable to UTC unifies all dates since database already stores in UTC and the TZ=UTC variable sets the server to UTC as well, this takes care of cookie expiration times as well. No conversions neccessary.
- Some browsers (such as Firefox) will continue to display expired cookies in the dev tools, but it won't send them so they are in effect cleared.
- Lastly on datetimes, simply convert on client where Date object will use the client local timezone.
