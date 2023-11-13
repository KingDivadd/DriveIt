# **DrivIt**

### An application to manage the maintenance documention, daily info, plan maintenance schedule and track the GPS location of assigned vehicles.

## Features

1.  Authentication

    1.  Signup. => name, email, password, [phone, pic]
    2.  Login.
    3.  Recover password
    4.  Signup and login via GOOGLE AUTH => work i nprogress

2.  User
    1.  Updating user profiles
        1.  Selecting role
        2.  Update user info => pic, phone,
    2.  View all users [feature only available to VEHICLE_COORDINATOR and MAINTENANCE_PERSONNEL]
    3.  Transfer user with DRIVER role to another departent {like from SEET to SAAT}
    4.  Assign vehicle to staffs, VEHICLE_ASSIGNEE. [feature only available to VEHICLE_COORDINATORS]
3.  Vehicle
    1.  Add a new vehicle, providing all necessay info. [can onle be added by VEHICLE_COORDINATOR]
    2.  Update vehicle information. [feature is only available to VEHICLE_COORDINATOR AND MAINTENANCE_PERSONNEL]
    3.  Get all vehicles. [feature is only available to VEHICLE_COORDINATOR AND MAINTENANCE_PERSONNEL]
4.  Maintenance Record
    1.  View maintenance records.
    2.  Create maintenance log. [feature only available to MAINTENANCE_PERSONNEL]
    3.  Record daily vehicle info. [feature mainly for VEHICLE_ASSIGNEE AND DRIVER]
    4.  Fetch all maintenance logs and/or Update. [feature only available to MAINTENANCE_PERSONNEL]
    5.  Fetch all daily vehicle logs and/or Update. [feature mainly for VEHICLE_ASSIGNEE AND DRIVER]
5.  Additional features

    1.  Send necessary info to the logged in email.

6.  Outstanding components
    1.  SERVER SIDE
        1.  Perfect the GOOGLE AUTH for signup and login.
        2.  Integrate GPS API.
        3.  fetch coordinate from a GPS hardware and update necessary infos.
        4.  More work on the vehicle daily log area.
        5.  Integrating socket.io.
    2.  CLIENT SIDE
        1.  A whole lot
