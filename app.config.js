
module.exports = () => {
  return {
    "expo": {
      "developmentClient": {
        "silentLaunch": false
      },
      "name": "tradeguard",
      "slug": "tradeGuard",
      "version": "0.0.1",
      "extra": {
        "eas": {
          "projectId": "dfd83b9f-7b94-4794-ac17-e36469433564"
        },
        "router": {
          "origin": false
        }
      },
      "orientation": "portrait",
      "icon": "./assets/images/icon.png",
      "scheme": "myapp",
      "userInterfaceStyle": "automatic",
      "newArchEnabled": true,
      "ios": {
        "supportsTablet": true
      },
      "android": {
        "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
        "adaptiveIcon": {
          "foregroundImage": "./assets/images/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        },
        "package": "com.tradeguard.app"
      },
      "web": {
        "bundler": "metro",
        "output": "static",
        "favicon": "./assets/images/favicon.png"
      },
      "plugins": [
        "expo-router",
        [
          "expo-splash-screen",
          {
            "image": "./assets/images/splash-icon.png",
            "imageWidth": 200,
            "resizeMode": "contain",
            "backgroundColor": "#ffffff"
          }
        ],
        "expo-secure-store"
      ],
      "experiments": {
        "typedRoutes": false
      }
    }
  }
}