import { Canvas } from "@react-three/fiber"
import { memo, useRef } from "react"
import { MeshBasicMaterial, Group, CircleGeometry, AmbientLight } from 'three'
import { useVoice } from "@humeai/voice-react";
import { FC } from 'react';
import { expressionColors } from "expression-colors";
import { isExpressionColor } from "@/utils/isExpressionColor";
import { motion } from "framer-motion-3d"
import { Circle } from "lucide-react";


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

type ExpressionLabelProps = {
    emotion: { name: string; score: number }
}

const ExpressionLabel: FC<ExpressionLabelProps> = ({ emotion }) => {
    const fill = isExpressionColor(emotion.name)
          ? expressionColors[emotion.name].hex
          : '#fff';
    return (
        <div className="flex grow-0 items-center gap-2 rounded-full border border-white bg-tan-200/50 px-1 py-0.5 font-mono text-xs uppercase">
            <Circle fill={fill} stroke={'white'} className="h-3 w-3"/>
            <span className="">{emotion.name}</span>
            <span className="ml-auto tabular-num opacity-50">
                {emotion.score.toFixed(2)}
            </span>
        </div>
    )
}
export const Visualizer:FC<VisualizerProps> = ({
    lastVoiceMessage,
}) => {
        const prosody = lastVoiceMessage?.models[0].entries ?? [];

        const topProsody = [...prosody].sort((a, b) => b.score - a.score).slice(0, 1)[0];

        return (
                <div className="pointer-events-none absolute inset-0 aspect-square">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        {lastVoiceMessage?.message.content}
                </div>

                <Canvas className="pointer-events-none absolute inset-0 p-8">
                    <DotRing prosody={prosody}/>
                </Canvas>
                <div className="mx-12 -mt-6">
                    <ExpressionLabel emotion={topProsody}/>
                </div>
                </div>
        )
}
