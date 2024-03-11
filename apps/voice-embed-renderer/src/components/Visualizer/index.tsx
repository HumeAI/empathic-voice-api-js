import { Canvas, GroupProps } from "@react-three/fiber"
import { memo, useRef } from "react"
import { MeshBasicMaterial, CircleGeometry } from 'three'
import { useVoice } from "@humeai/voice-react";
import { FC } from 'react';
import { expressionColors } from "expression-colors";
import { isExpressionColor } from "@/utils/isExpressionColor";
import { motion } from "framer-motion-3d"
import { Circle } from "lucide-react";

const Dot = memo(({ radius, color, isAnimated }: {radius: number; color: string, isAnimated: boolean }) => {

    return (
        <motion.mesh
            geometry={new CircleGeometry(0.75, 32)}
            material={new MeshBasicMaterial({ color })}
            initial={{ scale: 0}}
            animate={{ scale: radius}}
            exit={{ scale: 0}}
            transition={isAnimated ? {duration: 0.3} : {}}
        />
    );
});

type DotRingProps = {
    prosody: { name: string; score: number }[];
    micFft: FFTValues,
    fft: FFTValues,
    isSpeaking: boolean;
};

const DotRing: FC<DotRingProps> = ({ prosody, micFft, fft, isSpeaking}) => {
    const numDots = prosody.length;
    const radius = 3.5;
    const ringRef = useRef<GroupProps>(null);

    const fftAverage = fft.reduce((acc, val) => acc + val, 0) / fft.length;

    return (
        <motion.group ref={ringRef} position={[0, 0, 0]} animate={{scale: 1}} exit={{scale: 0}}>
                    {prosody.map((emotion, i) => {
                        const angle = (i / numDots) * Math.PI * 2;
                        const fill = isExpressionColor(emotion.name)
                            ? expressionColors[emotion.name].hex
                            : '#fff';
                        return (
                            <group position={[radius * Math.cos(angle), radius * Math.sin(angle), 0]}>
                                <Dot
                                    key={i}
                                    radius={isSpeaking ? (emotion.score > 0.1 ? emotion.score + fftAverage/5.5 : 0.05) : micFft[i % 24]/4.5}
                                    color={isSpeaking ? fill : '#efefef'}
                                    isAnimated={isSpeaking}
                                />
                            </group>
                        );
                    })}
        </motion.group>
    );
        };


type FFTValues = number[];

type VisualizerProps = {
    lastVoiceMessage: ReturnType<typeof useVoice>['lastVoiceMessage'];
    fft: FFTValues;
    micFft: FFTValues;
    isSpeaking: boolean;
};

type ExpressionLabelProps = {
    emotion: { name: string; score: string }
}

const ExpressionLabel: FC<ExpressionLabelProps> = ({ emotion }) => {
    const fill = isExpressionColor(emotion.name)
          ? expressionColors[emotion.name].hex
          : '#fff';
    return (
        <div className="flex grow-0 items-center gap-2 rounded-full border border-white bg-tan-200/50 px-1 py-0.5 font-mono text-xs uppercase">
            <Circle fill={fill} stroke={'white'} className="h-3 w-3"/>
            <span>{emotion.name}</span>
            <span className="ml-auto tabular-nums opacity-50">
                {Number(emotion.score).toFixed(2)}
            </span>
        </div>
    )
}

export const Visualizer:FC<VisualizerProps> = ({
    lastVoiceMessage,
    micFft,
    fft,
    isSpeaking,
}) => {
        const prosody = lastVoiceMessage?.models[0].entries ?? [];

        const sortedEmotions = [...prosody]
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((entry) => {
            return { ...entry, score: Number(entry.score).toFixed(3) };
        });

        return (
            <div className="pointer-events-none absolute inset-0 aspect-square">
            <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
                {isSpeaking ? (
                    <div className="flex flex-col gap-2">
                    {sortedEmotions.map((emotion) => (
                    <ExpressionLabel emotion={emotion}/>
                    ))}
                </div>
                ) : (
                    <div className="font-mono text-xs uppercase">
                        <span>Listening</span>
                    </div>
                )}
            </div>

            <Canvas className="pointer-events-none absolute inset-0 p-8">
                <DotRing prosody={prosody} micFft={micFft} fft={fft} isSpeaking={isSpeaking}/>
            </Canvas>
            </div>
        )
}
