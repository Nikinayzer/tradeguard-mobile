module.exports = () => {
    return {
        "expo": {
            "name": "TradeGuard",
            "slug": "tradeGuard",
            "version": "0.0.1",
            "icon": "./assets/icons/app.png",
            "scheme": "tradeguard",
            "extra": {
                "eas": {
                    "projectId": "dfd83b9f-7b94-4794-ac17-e36469433564"
                },
                "router": {
                    "origin": false
                }
            },
            "developmentClient": {
                "silentLaunch": false
            },
            "orientation": "portrait",
            "userInterfaceStyle": "automatic",
            "newArchEnabled": true,
            "ios": {
                "supportsTablet": true
            },
            "android": {
                "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
                "adaptiveIcon": {
                    "foregroundImage": "./assets/icons/app.png",
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