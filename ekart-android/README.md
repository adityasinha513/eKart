# Mithai Junction Android app

Customer Android app for the v1 shop. It shares the existing API gateway and Spring Boot microservices with the web shop.

## Requirements

- Node.js 22.13+
- Android Studio and an Android emulator, or a physical Android device
- MySQL and all five backend services running; follow the root README for database and service setup

## Start

```bash
npm install
npm run android
```

The default API endpoint `http://10.0.2.2:4000/api` works from an Android emulator when the gateway is on the host computer. For a real device, copy `.env.example` to `.env` and use the computer's reachable LAN IP address. The device and computer need to be on the same network.

The app supports account registration/sign-in, Sweet/Namkeen/Beverages browsing, cart, delivery or pickup checkout, GPS-pinned delivery addresses, the simulated online payment flow, COD, and order history. Access and refresh tokens are stored with Expo SecureStore.

Only Android is configured for this release. iOS is intentionally out of scope.
