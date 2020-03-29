# AWM_Chess

This is a coursework of University of Modena and Reggio Emilia. It is an online application to play chess. 

We made it using:

- Backend: Django, specifically Django Channels to handle web-sockets

- Frontend: React, using also React Router

- Mobile app: Expo Client, using react-native and react-navigation

You can use the deployed version of the app at: https://awm-chess.herokuapp.com/

You can download the mobile app (with Expo app) at: https://expo.io/@emafrasca/awm-chess 

We tested the application only on Android devices, so don't expect it to run on IOS.

PS: this repository is not the one used on heroku

## Clone and run locally
 
To set up a virtual environment:

    // on windows
    python -m venv venv
    venv\Scripts\activate.bat
    pip install -r requirements.txt

    // on linux
    python -m venv venv
    source venv/Scripts/activate
    pip install -r requirements.txt

Rename "parameters_rename.json" in "parameters.json", and inside it add your local ip to "ALLOWED_HOSTS"

Run django server on local ip with:

    python manage.py runserver [your-ip:port]

If you want to enable google sign in you have to insert your oauth2 api credentials inside "parameters.json"

The folders "frontend" and "AndroidApp" are not needed to the server to run. 
They contain our npm files of the client web and mobile applications.

### Mobile App locally

- Open the app and then disconnect from internet your device.

- In the loading screen insert [your-ip:port] of your django server

- Connect the device to the network where yout backend is running

If you modify the app inside AndroidApp and run your version, rename "parameters_rename.js" to "parameters.js". 
And if you want to enable Google sign in add inside it your ANDROID_CLIENT_ID key.