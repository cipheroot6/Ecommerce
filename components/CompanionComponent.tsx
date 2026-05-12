'use client';

import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import {cn, getSubjectColor} from "@/lib/utils";
import {Vapi, PUBLIC_VAPI_TOKEN} from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, {LottieRefCurrentProps} from "lottie-react";
import soundwaves from '@/constants/soundwaves.json'
import {getUserUsage, updateUserUsage} from '@/lib/actions/companion.action';

const DEMO_LIMIT_SECONDS = 60;
const LS_KEY = 'vapi_user_key';

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED',
}

const CompanionComponent = ({ companionId, subject, topic, name, userName, userImage, style, voice }: CompanionComponentProps) => {
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [messages, setMessages] = useState<SavedMessage[]>([]);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [keyInput, setKeyInput] = useState('');
    const [usingOwnKey, setUsingOwnKey] = useState(false);

    const vapiRef = useRef<InstanceType<typeof Vapi> | null>(null);
    const lottieRef = useRef<LottieRefCurrentProps>(null);
    const [mounted, setMounted] = useState(false);
    const [demoSecondsUsed, setDemoSecondsUsed] = useState(DEMO_LIMIT_SECONDS); // start maxed out until loaded
    const callStartRef = useRef<number | null>(null);

    // Load saved key from localStorage on mount
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(LS_KEY);
        if (saved) {
            setKeyInput(saved);
            setUsingOwnKey(true);
        }
        getUserUsage().then(setDemoSecondsUsed);
    }, []);

    useEffect(() => {
        if (lottieRef) {
            if (isSpeaking) {
                lottieRef.current?.play();
            } else {
                lottieRef.current?.stop();
            }
        }
    }, [isSpeaking, lottieRef]);

    const registerEvents = (instance: InstanceType<typeof Vapi>, isDemo: boolean) => {
        const onCallStart = () => {
            callStartRef.current = Date.now();
            setCallStatus(CallStatus.ACTIVE);
        };
        const onCallEnd = async () => {
            setCallStatus(CallStatus.FINISHED);
            if (isDemo && callStartRef.current) {
                const elapsed = Math.ceil((Date.now() - callStartRef.current) / 1000);
                await updateUserUsage(elapsed);
                setDemoSecondsUsed(prev => Math.min(DEMO_LIMIT_SECONDS, prev + elapsed));
                callStartRef.current = null;
            }
        };
        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                setMessages((prev) => [{ role: message.role, content: message.transcript }, ...prev]);
            }
        };
        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error: Error) => console.error('Vapi error:', error);
        const onCallStartFailed = (event: { stage: string; error: string }) => {
            console.error('Call start failed:', event.stage, event.error);
            setCallStatus(CallStatus.INACTIVE);
        };

        instance.on('call-start', onCallStart);
        instance.on('call-end', onCallEnd);
        instance.on('message', onMessage);
        instance.on('error', onError);
        instance.on('speech-start', onSpeechStart);
        instance.on('speech-end', onSpeechEnd);
        instance.on('call-start-failed', onCallStartFailed);
    };

    const startCall = async (ownKey?: string) => {
        const isDemo = !ownKey;

        if (isDemo) {
            const remaining = DEMO_LIMIT_SECONDS - demoSecondsUsed;
            if (remaining <= 0) {
                alert('You have used your 1-minute demo limit. Please use your own Vapi key to continue.');
                return;
            }
        }

        setCallStatus(CallStatus.CONNECTING);

        const token = ownKey ?? PUBLIC_VAPI_TOKEN;
        const remaining = DEMO_LIMIT_SECONDS - demoSecondsUsed;

        const instance = new Vapi(token);
        vapiRef.current = instance;
        registerEvents(instance, isDemo);

        const assistantOverrides: Record<string, unknown> = {
            variableValues: { subject, topic, style },
            clientMessages: ['transcript'],
            // Cap to exact remaining seconds — enforced server-side by Vapi
            ...(isDemo && { maxDurationSeconds: remaining }),
        };

        try {
            await instance.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!, assistantOverrides);
        } catch (error) {
            console.error('Failed to start session:', error);
            setCallStatus(CallStatus.INACTIVE);
        }
    };

    const handleCallClick = () => {
        if (callStatus === CallStatus.ACTIVE) {
            handleDisconnect();
            return;
        }
        setShowKeyModal(true);
    };

    const handleUseDemo = () => {
        setShowKeyModal(false);
        setUsingOwnKey(false);
        startCall(); // no key → public token + 60s hard cap
    };

    const handleUseOwnKey = () => {
        const trimmed = keyInput.trim();
        if (!trimmed) return;
        localStorage.setItem(LS_KEY, trimmed);
        setUsingOwnKey(true);
        setShowKeyModal(false);
        startCall(trimmed);
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapiRef.current?.stop();
    };

    const toggleMicrophone = () => {
        const muted = vapiRef.current?.isMuted();
        vapiRef.current?.setMuted(!muted);
        setIsMuted(!muted);
    };

    return (
        <section className="flex flex-col h-[70vh]">
            {/* Key selection modal — rendered into body via portal to escape stacking context */}
            {showKeyModal && mounted && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md flex flex-col gap-4 mx-4">
                        <h2 className="font-bold text-xl text-black">Choose how to start</h2>

                        <div
                            className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-black transition-colors"
                            onClick={handleUseDemo}
                        >
                            <p className="font-semibold text-black">Use demo key</p>
                            <p className="text-sm text-gray-500 mt-1">Free, no setup — {DEMO_LIMIT_SECONDS - demoSecondsUsed}s remaining of your 1-minute account limit.</p>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
                            <div>
                                <p className="font-semibold text-black">Use your own Vapi key</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    No time limits. Get your key at{' '}
                                    <a href="https://dashboard.vapi.ai" target="_blank" rel="noreferrer" className="text-primary underline">
                                        dashboard.vapi.ai
                                    </a>.
                                </p>
                            </div>
                            <input
                                type="text"
                                placeholder="Paste your Vapi web token..."
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm outline-none focus:border-black text-black"
                            />
                            <button
                                onClick={handleUseOwnKey}
                                disabled={!keyInput.trim()}
                                className="bg-primary text-white rounded-lg py-2 text-sm font-medium disabled:opacity-40 cursor-pointer"
                            >
                                Start with my key
                            </button>
                        </div>

                        <button
                            onClick={() => setShowKeyModal(false)}
                            className="text-sm text-gray-400 hover:text-black transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            , document.body)}

            <section className="flex gap-8 max-sm:flex-col">
                <div className="companion-section">
                    <div className="companion-avatar" style={{ backgroundColor: getSubjectColor(subject) }}>
                        <div className={cn(
                            'absolute transition-opacity duration-1000',
                            callStatus === CallStatus.FINISHED || callStatus === CallStatus.INACTIVE ? 'opacity-100' : 'opacity-0',
                            callStatus === CallStatus.CONNECTING && 'opacity-100 animate-pulse'
                        )}>
                            <Image src={`/icons/${subject}.svg`} alt={subject} width={150} height={150} className="max-sm:w-fit" />
                        </div>

                        <div className={cn('absolute transition-opacity duration-1000', callStatus === CallStatus.ACTIVE ? 'opacity-100' : 'opacity-0')}>
                            <Lottie
                                lottieRef={lottieRef}
                                animationData={soundwaves}
                                autoplay={false}
                                className="companion-lottie"
                            />
                        </div>
                    </div>
                    <p className="font-bold text-2xl">{name}</p>
                </div>

                <div className="user-section">
                    <div className="user-avatar">
                        <Image src={userImage} alt={userName} width={130} height={130} className="rounded-lg" />
                        <p className="font-bold text-2xl">{userName}</p>
                    </div>
                    <button className="btn-mic" onClick={toggleMicrophone} disabled={callStatus !== CallStatus.ACTIVE}>
                        <Image src={isMuted ? '/icons/mic-off.svg' : '/icons/mic-on.svg'} alt="mic" width={36} height={36} />
                        <p className="max-sm:hidden">
                            {isMuted ? 'Turn on microphone' : 'Turn off microphone'}
                        </p>
                    </button>
                    <button
                        className={cn(
                            'rounded-lg py-2 cursor-pointer transition-colors w-full text-white',
                            callStatus === CallStatus.ACTIVE ? 'bg-red-700' : 'bg-primary',
                            callStatus === CallStatus.CONNECTING && 'animate-pulse'
                        )}
                        onClick={handleCallClick}
                    >
                        {callStatus === CallStatus.ACTIVE
                            ? 'End Session'
                            : callStatus === CallStatus.CONNECTING
                                ? 'Connecting...'
                                : 'Start Session'
                        }
                    </button>
                    {callStatus === CallStatus.INACTIVE && (
                        <p className="text-xs text-muted-foreground text-center">
                            {usingOwnKey
                                ? <><span>Using your Vapi key</span> · <span className="text-primary cursor-pointer" onClick={() => setShowKeyModal(true)}>change</span></>
                                : demoSecondsUsed >= DEMO_LIMIT_SECONDS
                                    ? <span className="text-red-500">Demo limit reached · <span className="text-primary cursor-pointer" onClick={() => setShowKeyModal(true)}>use your own key</span></span>
                                    : `Demo mode · ${DEMO_LIMIT_SECONDS - demoSecondsUsed}s remaining`
                            }
                        </p>
                    )}
                </div>
            </section>

            <section className="transcript">
                <div className="transcript-message no-scrollbar">
                    {messages.map((message, index) => {
                        if (message.role === 'assistant') {
                            return (
                                <p key={index} className="max-sm:text-sm">
                                    {name.split(' ')[0].replace(/[.,]/g, '')}: {message.content}
                                </p>
                            );
                        } else {
                            return (
                                <p key={index} className="text-primary max-sm:text-sm">
                                    {userName}: {message.content}
                                </p>
                            );
                        }
                    })}
                </div>
                <div className="transcript-fade" />
            </section>
        </section>
    );
};

export default CompanionComponent;
