# Loo - Bathroom Finder App

A mobile application that helps users find and rate public bathrooms in their vicinity. The app includes features such as bathroom location mapping, accessibility information, ratings, and a reporting system.

## Tech Stack

### Core Technologies
- React Native: ^18.2.0
- Expo: ~52.0.36
- Firebase: ^10.8.0
- TypeScript: ^5.7.3

### Key Dependencies
#### Frontend
- React Native Maps: 1.18.0
- React Navigation: ^6.1.9
- Expo Location: ~18.0.7
- React Native BTR: ^2.2.1
- React Native Google Places Autocomplete: ^2.5.7

#### Backend & Services
- Firebase Admin: ^13.2.0
- Firebase Functions: ^6.3.2
- Geofirestore: ^5.2.0
- Nodemailer: ^6.10.0

### Development Dependencies
- @babel/core: ^7.20.0
- @types/react: ~18.3.12
- @types/react-native: ^0.72.8
- TypeScript: ^5.7.3

## Features
- Real-time bathroom location mapping
- Accessibility information
- User ratings and reviews
- Report functionality for issues
- Email notification system
- Location-based search
- Detailed bathroom information

## Setup Instructions

### Prerequisites
1. Node.js (Latest LTS version recommended)
2. Expo CLI: `npm install -g expo-cli`
3. Firebase CLI: `npm install -g firebase-tools`

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/TStarzl/Loo.git
   cd Loo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Configure Firebase Functions
4. Update Firebase configuration in the app

## Environment Setup
Make sure to set up the following environment variables:
- Firebase configuration
- Google Maps API key
- SMTP configuration for email notifications

## Running the App
- iOS: `npm run ios`
- Android: `npm run android`
- Web: `npm run web`

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License
This project is private and proprietary.

## Contact
For any inquiries, please reach out to the repository owner.

## Project Structure

```
bathroom-finder/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── types/          # TypeScript type definitions
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   └── styles/         # Shared styles
├── assets/             # Images, fonts, etc.
├── App.tsx            # Root component
├── app.json          # Expo configuration
└── package.json      # Project dependencies
```

## Built With

- [React Native](https://reactnative.dev/) - Mobile framework
- [Expo](https://expo.dev/) - Development platform
- [TypeScript](https://www.typescriptlang.org/) - Programming language
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [React Native Maps](https://github.com/react-native-maps/react-native-maps) - Maps integration

## Acknowledgments

- Thanks to all contributors who participate in this project
- Inspired by the need for better public bathroom accessibility
- Built with ❤️ using React Native and TypeScript