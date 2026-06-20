import ScrollHero from "../components/ui/ethereal";
import WalletConnectButton from "../components/WalletConnectButton";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

function RevealText({ text }: { text: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 30, filter: "blur(8px)" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="inline-block"
    >
      {text}
    </motion.span>
  );
}

function SlowFadeText({ text }: { text: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
      className="inline-block"
    >
      {text}&nbsp;
    </motion.span>
  );
}

function TypewriterText({ text, delayStart = 0.4 }: { text: string; delayStart?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-100px" });

  return (
    <span ref={ref}>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.05, delay: delayStart + index * 0.02 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

interface LandingPageProps {
  connectedAddress: string | null;
  onConnect: (address: string | null) => void;
}

export default function LandingPage({ connectedAddress, onConnect }: LandingPageProps) {
  return (
    <ScrollHero
      sections={[
        {
          id: "hero",
          headline: "ShieldPass",
          subheadline: <RevealText text="Zero-Knowledge P2P" />,
          body: <TypewriterText text="Trade crypto for naira with zero identity exposure — powered by ZK proofs on Stellar." />,
          action: (
            <WalletConnectButton
              connectedAddress={connectedAddress}
              onConnect={onConnect}
            />
          )
        },
        {
          id: "privacy",
          headline: "Private",
          subheadline: <RevealText text="By Default" />,
          body: (
            <span>
              <SlowFadeText text="Your BVN and" />
              <TypewriterText 
                text="personal data never leave your device. Only cryptographic proofs travel on-chain." 
                delayStart={1.5} 
              />
            </span>
          ),
        },
        {
          id: "escrow",
          headline: "Trustless",
          subheadline: "Escrow",
          body: "Smart contracts lock funds until both parties confirm — no middlemen, no disputes.",
        },
        {
          id: "trade",
          headline: "Trade",
          subheadline: "Freely",
          body: "Peer-to-peer crypto/naira exchange with the safety of KYC but none of the exposure.",
        },
        {
          id: "how-it-works-intro",
          headline: "How It Works",
          subheadline: <RevealText text="The Protocol" />,
          body: <TypewriterText text="A seamless 3-step process to trade securely without exposing your identity." />,
        },
        {
          id: "how-it-works-1",
          headline: "Step 1",
          subheadline: "Connect & Verify",
          body: "Link your Stellar wallet and generate a Zero-Knowledge proof of your identity. Your actual data remains entirely on your device.",
          mediaUrl: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id: "how-it-works-2",
          headline: "Step 2",
          subheadline: "Trustless Escrow",
          body: "Initiate a trade. Your assets are locked securely in a smart contract. No middleman can access or freeze your funds.",
          mediaUrl: "https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&w=1200&q=80"
        },
        {
          id: "how-it-works-3",
          headline: "Step 3",
          subheadline: "P2P Settlement",
          body: "Once fiat payment is confirmed, the smart contract instantly releases the crypto to the buyer's wallet. Fast, secure, and private.",
          mediaUrl: "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1200&q=80"
        },
      ]}
      colorPalette={{
        primary: "#6366f1",
        secondary: "#8b5cf6",
        tertiary: "#ec4899",
        accent: "#06ffa5",
        dark: "#0a0a0a",
      }}
      logo="SHIELDPASS"
      menuItems={["Marketplace", "Dashboard", "Onboarding"]}
    />
  );
}
