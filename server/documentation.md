# DOCUMENTATION FOR THE BACKEND

1. Backend API Endpoint:

   - Base URL: https://futa-fleet-guard.onrender.com
   - for authentication/authorization for the use of protected features (like update of vehicle info, removing of users, transfer of drivers, etc), JWT token in the form of bearer token was used.

2. Available API Endpoints:

   1. Authenticaton Schema

      1. signup [ POST request] => /api/auth/signup
         ## Required Info
         1. lastName 2. firstName 3. email 4. phone 5.role => ['driver', 'vehicle_asignee', 'vehicle_coordinator', 'maintenance_personnel'] 6. staffId 7. pic 8. password
      2. login [ POST request] => /api/auth/login
         ## Required Info
         1. email_staffId 2. password
      3. Password recovery code [ POST request] => /api/auth/password-recovery-code
         ## Required Info
         1. email
      4. Verify Recovery code [ POST request] => /api/auth/recovery-code-verify
         ## Required Info
         1. email 2. code
      5. Recover Password => /api/auth/recover-password
         ## Required Info
         1. email 2. password (this will be the new password)

   2. User

      1. Get all users [ GET request ]=> /api/user/all-users
         ## Required info
         1. Bearer token for authorization [to get logged in user info and filter it out from the users array]
      2. One user [GET request] => /api/user/find-user
         ## Required Info
         1. Bearer token
      3. Filter / search for user [ POST request] => /api/user/filter-users
         ## Required info
         1. Any of [ 1. firstName 2. lastName 3. dept 4. role ]
         # this shows all the users including the logged in user
      4. Update / edit user info [PATCH request] => /api/user/update-user-info
         ## Required Info
         1. user_id and any of [1. firstName, 2. lastName, 3. staffId, 4. phone, 5. pic]
         2. Bearer token for authorization [so only a logged in user can update his profile and his alone]
      5. Assign Driver [PATCH request] => /api/user/assign-driver
         ## Required Info
         1. Bearer token for authorization [so that only user logged in as vehicle coordinator can perform operation]
         2. Both of [1. assignee_id, 2. driver_id]
      6. Remove Driver [PATCH request] =>/api/user/remove-driver
         ## Required Info
         1. Bearer token for authorization [so that only user logged in as ''vehicle_coordinator' can perform operation]
         2. assignee_id [we are woking on the assumption that only a driver is assigned to an assignee]
      7. Remove User [DELETE request] => /api/user/delete-user
         ## Required Info
         1. Bearer token for authorization [so that only user logged in as ''vehicle_coordinator' can perform operation]
         2. assignee_id [we are woking on the assumption that only a driver is assigned to an assignee]

   3. vehicle Schema

      1. Add a new Vehicle [POST request] => /api/vehicle/add-vehicle
         ## Required Info
         1. plate_no, 2. engine_no, 3. vehicle_type ['bus', 'car'], 4. brand, 5. current_millage
         2. Bearer token for authorization [so that only user logged in as 'vehicle_coordinator' can perform the vehicle adding operation]
      2. Get all vehicles [GET request] => /api/vehicle/all-vehicles/
         ## Required Info
         1. Bearer token
      3. Logged In user Vehicle [GET request] => /api/vehicle/user-vehicle
         ## Required Info
         1. Bearer token
      4. Admin Update Vehicle Info [PATCH request] => /api/vehicle/admin-update-vehicle-info
         ## Required Info
         1. Bearer token for authorization [so that only user logged in as 'vehicle_coordinator' can perform the vehicle adding operation]
         2. 1. vehicle_id, 2. brand, 3. plate_no, 4. vehicle_type, 5. current_millage, 6. engine_no, current_state, department
      5. Delete Vehicle [DELETE request] => /api/vehicle/delete-vehicle
         ## Required Info
         1. Bearer token for authorization [so that only user logged in as 'vehicle_coordinator' can perform the vehicle adding operation]
         2. vehicle_id
      6. Assign Vehicle [PATCH request] => /api/vehicle/admin-update-vehicle-info
         ## Required Info
         1. Bearer token for authorization [so that only user logged in as 'vehicle_coordinator' can perform the vehicle adding operation]
         2. 1. Vehicle_id, 2. assignee_id [the ID of the vehicle_assignee]

   4. Maintenance Schema

      1. Create maintenance log [POST request] => /api/maint-log/create-maint-log
         ## Required Info
         1. Bearer Token
         2. 1. vehicle_id, 2. issues. such as ["Poor braking system", "Vehicle due for service", "Bad suspension"]. 3. solutions. such as ["I replaced the front wheels braking pads"]. 4. cost
      2. Get all maintenance log [POST request] => /api/maint-log/all-maint-log
         ## Required Info
         1. Bearer Token
         2. 1. start_date 2. end_date
      3. Edit maintenance log [PATCH request] => /api/maint-log/edit-maint-log
         ## Required Info
         1. Bearer Token
         2. 1. maintenance log id, 2. issues: [], 3. solutions: [], cost: ""
      4. Plan maintenance [POST request] => /api/maint-log/plan-maint
         ## Required Info
         1. Bearer Token
         2. 1. vehicle id, 2. services: [], 3. concerns: [], 4. proposedDate: YYYY-MM-DD
      5. Edit plan maintenance [PATCH request] => /api/maint-log/edit-planned-maint
         # Required Info
         1. Bearer Token
         2. 1. planMaintLog id, 2. services: [], 3. concersns: [], 4. proposedDate: YYYY-MM-DD
      6. Get all planned maintenance [POST request] => /api/maint-log/all-planned-maint
         # Required Info
         1. Bearer Token
         2. 1. start_date: YYYY-MM-DD, 2. end_date: YYYY-MM-DD (when neighther is provided, all logs are fetched.)

   5. Notification Schema
      1. Get all notifications [GET request] => /api/notification/all-notifications
         ## Required Info
         1. Bearer token
      2. Filter all notifications (based on admin as vehicle_coordiinator, vehicle_assignee, and maintenance_personnel) [GET request] => /api/notification/filter-notifications
         ## Required Info
         1. Bearer Token
         2. 1. role: (either of admin as vehicle_coordinator, vehicle_assingee, or maintenance_personnel) => this is gotten among the fetched data when a user logs in or signs up.
   6. Driver Schema
      1. Create daily driver's log [POST request] => /api/drivers-log/new-log
         ## Required Info
         1. Bearer token
         2. 1. vehicle_id, 2. starting_location, 3. ending_location, 4. route, 5. starging_mileage, 6. ending_mileage, 7. fuelLevel: (either of low, mid, or full)
      2. Edit daily driver's log [PATCH request] => /api/drivers-log/edit-log
         ## Required Info
         1. Bearer token
         2. 1. log_id (gotten when a log is clicked), 2. 1. vehicle_id, 2. starting_location, 3. ending_location, 4. route, 5. starging_mileage, 6. ending_mileage, 7. fuelLevel: (either of low, mid, or full)
      3. Get all daily driver's log [GET request] => /api/drivers-log/all-logs
         ## Required Info
         1. Bearer token
         2. 1. start_date: YYYY-MM-DD 2. end_date: YYYY-MM-DD (when neigther is provided, all logs are fetched)
      4. Delete daily driver's log [DELETE request] => /api/drivers-log/delete-log
         ## Required Info
         1. Bearer token
         2. vehicle_id

3. Data Formats:

   - The API primarily returns data in JSON format. Ensure that your frontend can handle JSON responses.

4. API Data Result:
   1. For successful data fetch.
   - .userInfo
   2. For errors
   - .err
   3. For messages
   - .msg
