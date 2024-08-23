import OnboardingSwiper from 'react-native-onboarding-swiper';
import { OnboardFlow } from 'react-native-onboard';
import React from "react";
import { Image } from "react-native";
import { Stack } from 'expo-router';

export function Onboarding() {
    return (
        <><Stack.Screen
            options={{
                title: "Onboarding",
            }} /><OnboardFlow

                pages={[
                    {
                        title: 'Welcome to Alby Mobile',
                        subtitle: 'Learn more about self-custodial Lightning',
                        imageUri: Image.resolveAssetSource(require('../assets/adaptive-icon.png')).uri,
                    },
                    {
                        title: 'Connect your Node easily',
                        subtitle: ' ',
                        imageUri: 'https://frigade.com/img/example2.png',
                    }
                ]}
                type={'bottom-sheet'} /></>
        // <OnboardingSwiper
        //     pages={[
        //         {
        //             backgroundColor: '#fff',
        //             image: <Image source={require('../assets/adaptive-icon.png')} />,
        //             title: 'Onboarding',
        //             subtitle: 'Done with React Native Onboarding Swiper',
        //         },
        //         {
        //             backgroundColor: '#fff',
        //             image: <Image source={require('../assets/adaptive-icon.png')} />,
        //             title: 'Onboarding',
        //             subtitle: 'Done with React Native Onboarding Swiper',
        //         },

        //     ]}
        // />
    );
}
