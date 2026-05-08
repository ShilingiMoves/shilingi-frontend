import React from 'react';
import { Composition } from 'remotion';
import { ShilingiIntroVideo } from './ShilingiIntroVideo';

export const RemotionRoot = () => (
    <Composition
        id="ShilingiIntroVideo"
        component={ShilingiIntroVideo}
        durationInFrames={360}
        fps={30}
        width={1920}
        height={1080}
    />
);
