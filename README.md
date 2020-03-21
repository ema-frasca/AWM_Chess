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

Run django server on local ip with:

    python manage.py runserver [your-ip:port]

Download app with expo app: https://expo.io/@emafrasca/awm-chess 

In the loading screen insert [your-ip:port] of your django server


We tested the application only on Android devices, so don't expect it to run on IOS.

The folders "frontend" and "AndroidApp" are not needed to the server to run. 
They contain our npm packages of the client web and mobile applications. 
