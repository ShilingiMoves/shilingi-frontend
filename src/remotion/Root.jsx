import React from 'react';
import { Composition } from 'remotion';
import { ShilingiDashboardGuideVideo } from './ShilingiDashboardGuideVideo';
import { ShilingiIntroVideo } from './ShilingiIntroVideo';

export const RemotionRoot = () => (
    <>
        <Composition
            id="ShilingiIntroVideo"
            component={ShilingiIntroVideo}
            durationInFrames={360}
            fps={30}
            width={1920}
            height={1080}
        />
        <Composition
            id="ShilingiDashboardGuideVideo"
            component={ShilingiDashboardGuideVideo}
            durationInFrames={390}
            fps={30}
            width={1080}
            height={1350}
        />
    </>
);
