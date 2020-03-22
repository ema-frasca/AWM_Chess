# AWM_Chess

This is a coursework of University of Modena and Reggio Emilia. It is an online application to play chess. 

We made it using:

- Backend: Django, specifically Django Channels to handle web-sockets

- Frontend: React, using also React Router

- Mobile app: Expo Client, using react-native and react-navigation

 
To set up a virtual environment:

    python -m venv venv
    venv\Scripts\activate.bat
    pip install -r requirements.txt

Rename "parameters_rename.json" in "parameters.json", and inside it add your local ip to "ALLOWED_HOSTS"

Run django server on local ip with:

    python manage.py runserver [your-ip:port]

If you want to enable google sign in you have to insert your oauth2 api credentials inside "parameters.json"

The folders "frontend" and "AndroidApp" are not needed to the server to run. 
They contain our npm files of the client web and mobile applications.

### Mobile App

Download app with Expo app: https://expo.io/@emafrasca/awm-chess 

In the loading screen insert [your-ip:port] of your django server

We tested the application only on Android devices, so don't expect it to run on IOS.

If you modify the app inside AndroidApp and run your version, rename "parameters_rename.js" to "parameters.js". 
And if you want to enable Google sign in add inside it your ANDROID_CLIENT_ID key.