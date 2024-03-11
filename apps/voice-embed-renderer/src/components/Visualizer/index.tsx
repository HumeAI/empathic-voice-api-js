import { Canvas } from "@react-three/fiber"
import { memo, useRef } from "react"
import { MeshBasicMaterial, Group, CircleGeometry } from 'three'
import { useVoice } from "@humeai/voice-react";
import { FC } from 'react';
import { expressionColors } from "expression-colors";
import { isExpressionColor } from "@/utils/isExpressionColor";
import { motion } from "framer-motion-3d"


const Dot = memo(({ radius, color }: {radius: number; color: string }) => {

    return (
        <motion.mesh
            geometry={new CircleGeometry(0.75, 32)}
            material={new MeshBasicMaterial({ color })}
            initial={{ scale: 0}}
            animate={{ scale: radius}}
            transition={{ duration: 0.5, ease: 'easeIn'}}
        />
    );
});

type DotRingProps = {
    prosody: { name: string; score: number }[];
};

const DotRing: FC<DotRingProps> = ({ prosody }) => {
    const numDots = prosody.length;
    const radius = 3.5;
    const ringRef = useRef<Group>(null);
    
    return (
        <group ref={ringRef} position={[0, 0, 0]}>
            {prosody.map((emotion, i) => {
                const angle = (i / numDots) * Math.PI * 2;
                const fill = isExpressionColor(emotion.name)
          ? expressionColors[emotion.name].hex
          : '#fff';
                return (
                    <group position={[radius * Math.cos(angle), radius * Math.sin(angle), 0]}>
                        <Dot
                            key={i}
                            radius={emotion.score > 0.1 ? emotion.score : 0.1}
                            color={emotion.score > 0.1 ? fill : '#efefef'}
                        />
                    </group>
                );
            })}
        </group>
    );
        };



type VisualizerProps = {
    lastVoiceMessage: ReturnType<typeof useVoice>['lastVoiceMessage'];
};

export const Visualizer:FC<VisualizerProps> = ({
    lastVoiceMessage,
}) => {
        const prosody = lastVoiceMessage?.models[0].entries ?? [];

        return (
                <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        {lastVoiceMessage?.message.content}
                </div>

                <Canvas className="pointer-events-none absolute inset-0 p-4">
                        <DotRing prosody={prosody}/>
                </Canvas>
                </div>
        )
}
